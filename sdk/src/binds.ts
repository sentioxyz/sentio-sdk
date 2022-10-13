import { BindOptions, getOptionsSignature } from './core/bind-options'
import { BaseProcessor, ContractView } from './core'
import { Networkish } from '@ethersproject/networks'
import { getNetwork } from '@ethersproject/providers'
import { BaseContract } from 'ethers'
import { ContractNamer } from './contract-namer'

function getKey(abiName: string, address: string, network: Networkish) {
  const chainId = getNetwork(network).chainId.toString()
  return [abiName, address.toLowerCase(), chainId].join('_')
}

// TODO move to processor state
const addressToName = new Map<string, string>()
const namerMap = new Map<string, ContractNamer>()

// Get contract name by ABI, and other options
// If there is contract using same ABI and different (address, network) pair
// It will be renamed as ABI, ABI_1, ABI_2
// Otherwise just use same contract name
export function getContractName(
  abiName: string,
  contractName: string | undefined,
  address: string,
  network: Networkish = 1
): string {
  const key = getKey(abiName, address, network)
  let name = addressToName.get(key)
  if (name) {
    return name
  }
  if (contractName) {
    addressToName.set(key, contractName)
    return contractName
  }

  let namer = namerMap.get(abiName)
  if (!namer) {
    namer = new ContractNamer(abiName)
    namerMap.set(abiName, namer)
  }
  name = namer.nextName()
  addressToName.set(key, name)
  return name
}

// Dedup processor that bind multiple times
export function getProcessor(opts: BindOptions) {
  const sig = getOptionsSignature(opts)
  return global.PROCESSOR_STATE.processorMap.get(sig)
}

export function addProcessor(opts: BindOptions, processor: BaseProcessor<any, any>) {
  const sig = getOptionsSignature(opts)

  global.PROCESSOR_STATE.processors.push(processor)
  global.PROCESSOR_STATE.processorMap.set(sig, processor)
}

export function getContractByABI(abiName: string, address: string, network: Networkish) {
  const key = getKey(abiName, address, network)
  return global.PROCESSOR_STATE.contracts.get(key)
}

export function addContractByABI(
  abiName: string,
  address: string,
  network: Networkish,
  contract: ContractView<BaseContract>
) {
  const key = getKey(abiName, address, network)
  return global.PROCESSOR_STATE.contracts.set(key, contract)
}
