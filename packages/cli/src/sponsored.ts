import { ethers } from 'ethers'
import chalk from 'chalk'
import { ForwardRequest, signForwardRequest } from './eip712.js'
import { discoverRelayerUrls } from './relayer.js'
import { rpcSubmitForwardRequest, ForwardRequestRpc, SubmitForwardResponse } from './indexer-rpc.js'
import { FORWARDER_ABI, RELAY_FEE_REGISTRY_ABI } from './abi.js'

export interface BuildArgs {
  signerAddress: string
  owner?: string
  target: string
  data: string
  gas: bigint
  nonceKey: bigint
  nonceValue: bigint
  deadline: bigint
  maxFee: bigint
}

export function buildForwardRequest(a: BuildArgs): ForwardRequest {
  return {
    from: a.signerAddress,
    payer: a.owner ?? a.signerAddress,
    target: a.target,
    data: a.data,
    gas: a.gas,
    nonceKey: a.nonceKey,
    nonceValue: a.nonceValue,
    deadline: a.deadline,
    maxFee: a.maxFee
  }
}

export interface SponsoredCallOptions {
  wallet: ethers.BaseWallet
  provider: ethers.JsonRpcProvider
  chainId: bigint
  forwarderAddress: string
  relayFeeRegistryAddress: string
  indexerRegistryAddress: string
  target: string
  data: string
  owner?: string
  nonceKey?: bigint
  maxFeeMultiplier?: number // default 1.2
  gasLimit?: bigint // default 1_000_000
  deadlineSeconds?: bigint // default now+600s
}

/// One-shot helper: discover, estimate, sign, submit, with failover.
export async function executeSponsored(opts: SponsoredCallOptions): Promise<SubmitForwardResponse> {
  const selectorHex = opts.data.slice(0, 10) // 0x + 8 hex chars
  const nonceKey = opts.nonceKey ?? 0n
  const gasLimit = opts.gasLimit ?? 1_000_000n
  const multiplier = opts.maxFeeMultiplier ?? 1.2
  const deadline = BigInt(Math.floor(Date.now() / 1000)) + (opts.deadlineSeconds ?? 600n)

  // Read fee once — it doesn't depend on the relayer URL or nonce
  const registry = new ethers.Contract(opts.relayFeeRegistryAddress, RELAY_FEE_REGISTRY_ABI, opts.provider)
  const currentFee = (await registry.feeOf(opts.target, selectorHex)) as bigint
  if (currentFee === 0n) {
    throw new Error(`op not sponsored: target=${opts.target} selector=${selectorHex}`)
  }
  const maxFee = (currentFee * BigInt(Math.floor(multiplier * 1000))) / 1000n

  const forwarder = new ethers.Contract(opts.forwarderAddress, FORWARDER_ABI, opts.provider)
  const relayerUrls = await discoverRelayerUrls(opts.provider, opts.indexerRegistryAddress)

  return tryRelayerWithFailover(relayerUrls, async (relayerUrl) => {
    // Re-read nonce per attempt: a prior attempt may have raced with another
    // tx submitted by the same user, or the user may have submitted self-pay
    // ops between attempts.
    const nonceValue = (await forwarder.nonceOf(opts.wallet.address, nonceKey)) as bigint
    const req = buildForwardRequest({
      signerAddress: opts.wallet.address,
      owner: opts.owner,
      target: opts.target,
      data: opts.data,
      gas: gasLimit,
      nonceKey,
      nonceValue,
      deadline,
      maxFee
    })
    const domain = {
      name: 'SentioForwarder',
      version: '1',
      chainId: opts.chainId,
      verifyingContract: opts.forwarderAddress
    }
    const signature = await signForwardRequest(opts.wallet, req, domain)
    const rpcReq: ForwardRequestRpc = {
      from: req.from,
      payer: req.payer,
      target: req.target,
      gas: req.gas.toString(10),
      nonceKey: req.nonceKey.toString(10),
      nonceValue: Number(req.nonceValue),
      deadline: Number(req.deadline),
      maxFee: req.maxFee.toString(10),
      data: req.data,
      signature
    }
    console.log(chalk.gray(`  Sponsored relay → ${relayerUrl}`))
    const resp = await rpcSubmitForwardRequest(relayerUrl, rpcReq)
    if (resp.relayError) {
      throw new Error(`relayer rejected: ${resp.relayError.error}`)
    }
    console.log(chalk.green(`  Tx mined in block ${resp.blockNumber}: ${resp.txHash}`))
    return resp
  })
}

/// Tries `fn` against each URL in order, returning the first successful result.
/// When `SENTIO_RELAYER_URL` is set in the environment (explicit single-target mode)
/// only the first URL is tried — failover is disabled. Otherwise up to 3 URLs
/// are attempted before giving up.
export async function tryRelayerWithFailover<T>(urls: string[], fn: (url: string) => Promise<T>): Promise<T> {
  let lastErr: unknown
  const explicit = process.env.SENTIO_RELAYER_URL != null
  const maxAttempts = explicit ? 1 : Math.min(urls.length, 3)
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn(urls[i])
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`failed to relay after ${maxAttempts} attempt(s): ${(lastErr as Error)?.message}`)
}
