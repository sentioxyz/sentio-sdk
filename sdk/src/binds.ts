import { BindOptions, getOptionsSignature } from './core/bind-options'
import { BaseProcessor, ContractView } from './core'
import { Networkish } from '@ethersproject/networks'
import { getNetwork } from '@ethersproject/providers'
import { BaseContract } from 'ethers'

function getKey(abiName: string, address: string, network: Networkish) {
  const chainId = getNetwork(network).chainId.toString()
  return [abiName, address.toLowerCase(), chainId].join('_')
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
