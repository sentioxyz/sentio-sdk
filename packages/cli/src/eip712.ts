import { ethers, TypedDataDomain } from 'ethers'

export interface ForwardRequest {
  from: string
  payer: string
  target: string
  gas: bigint
  nonceKey: bigint
  nonceValue: bigint
  deadline: bigint
  maxFee: bigint
  data: string // 0x-prefixed hex
}

export const FORWARDER_DOMAIN_TYPES = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'payer', type: 'address' },
    { name: 'target', type: 'address' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonceKey', type: 'uint192' },
    { name: 'nonceValue', type: 'uint64' },
    { name: 'deadline', type: 'uint48' },
    { name: 'maxFee', type: 'uint256' },
    { name: 'data', type: 'bytes' }
  ]
}

export function hashForwardRequest(req: ForwardRequest, domain: TypedDataDomain): string {
  return ethers.TypedDataEncoder.hash(domain, FORWARDER_DOMAIN_TYPES, req)
}

export async function signForwardRequest(
  signer: ethers.BaseWallet,
  req: ForwardRequest,
  domain: TypedDataDomain
): Promise<string> {
  return signer.signTypedData(domain, FORWARDER_DOMAIN_TYPES, req)
}
