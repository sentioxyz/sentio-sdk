import { BindOptions, getOptionsSignature } from '../core/bind-options.js'
import { ContractView } from '../core/index.js'
import { BaseProcessor } from './base-processor.js'
import { Networkish, Network } from 'ethers/providers'

import { BaseContract } from 'ethers'
import { MapStateStorage } from '@sentio/runtime'

export class ProcessorState extends MapStateStorage<BaseProcessor<any, any>> {
  static INSTANCE = new ProcessorState()
}

// from abiName_address_chainId => contract wrapper
const contracts = new Map<string, ContractView<BaseContract>>()

function getKey(abiName: string, address: string, network: Networkish) {
  const chainId = Network.from(network).chainId.toString()
  return [abiName, address.toLowerCase(), chainId].join('_')
}

// Dedup processor that bind multiple times
export function getProcessor(opts: BindOptions) {
  const sig = getOptionsSignature(opts)
  return ProcessorState.INSTANCE.getValue(sig)
}

export function addProcessor(opts: BindOptions, processor: BaseProcessor<any, any>) {
  const sig = getOptionsSignature(opts)

  ProcessorState.INSTANCE.getOrSetValue(sig, processor)
}

export function getContractByABI(abiName: string, address: string, network: Networkish) {
  const key = getKey(abiName, address, network)
  return contracts.get(key)
}

export function addContractByABI(
  abiName: string,
  address: string,
  network: Networkish,
  contract: ContractView<BaseContract>
) {
  const key = getKey(abiName, address, network)
  return contracts.set(key, contract)
}
