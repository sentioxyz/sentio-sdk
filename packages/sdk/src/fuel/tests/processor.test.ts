import { TestProcessorServer } from '../../testing/index.js'
import { FuelProcessor } from '../fuel-processor.js'
import { FuelChainId } from '@sentio/chain'
import abi from './abis/counter-contract-abi.json'
import testData from './test-data.json'
import { afterAll } from '@jest/globals'
import { State } from '@sentio/runtime'
import { bn, calculateVmTxMemory, Interface, Provider } from 'fuels'
import { getRpcEndpoint } from '../network.js'
import { decodeFuelTransactionWithAbi } from '../transaction.js'

describe('fuel network tests', () => {
  const ADDRESS = '0xdb0d550935d601c45791ba18664f0a821c11745b1f938e87f10a79e21988e850'

  const service = new TestProcessorServer(async () => {
    FuelProcessor.bind({
      address: ADDRESS,
      chainId: FuelChainId.FUEL_TESTNET,
      //@ts-ignore fuel abi changed
      abi
    }).onTransaction(async (tx, ctx) => {
      ctx.eventLogger.emit('tx', {
        distinctId: tx.id,
        message: 'status is ' + tx.status
      })
    })
    /*  .onCall('complex', async (call, ctx) => {
        ctx.eventLogger.emit('call', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
          message: `complex call: (${call.functionScopes[0].getCallConfig().args}) -> (${call.value})`
        })
      })*/
  })
  beforeAll(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length).toBeGreaterThan(0)
    expect(config.contractConfigs[0].fuelCallConfigs.length).toBeGreaterThanOrEqual(1)
  })

  // skip for now until onCall is fixed
  test.skip('test onTransaction ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET)

    const events = res.result?.events
    expect(events).toHaveLength(2)
    expect(events?.[0]?.message).toEqual('status is success')
  })

  // skip for now until onCall is fixed
  test.skip('test onCall ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET)

    const events = res.result?.events
    expect(events).toHaveLength(2)
    expect(events?.[1]?.message).toContain('complex call')
  })

  test('tx decode', async () => {
    const tx = await decodeFuelTransactionWithAbi(
      testData,
      { ADDRESS: abi },
      await Provider.create(getRpcEndpoint(FuelChainId.FUEL_TESTNET))
    )
    expect(tx.operations).toBeDefined()
  })

  test('test decode', async () => {
    const receipt = testData.status.receipts[0]
    const param1 = receipt.param1
    const url = getRpcEndpoint(FuelChainId.FUEL_TESTNET)
    const provider = await Provider.create(url)
    const chain = provider.getChain()
    const maxInputs = chain.consensusParameters.txParameters.maxInputs
    const argsOffset = bn(param1)
      .sub(calculateVmTxMemory({ maxInputs: maxInputs.toNumber() }))
      .toNumber()
    const argsOffset2 = bn(receipt.param2)
      .sub(calculateVmTxMemory({ maxInputs: maxInputs.toNumber() }))
      .toNumber()
    const rawPayload = testData.rawPayload
    // slice(2) to remove first 0x, then slice again to remove offset and get only args
    const encodedArgs = `0x${rawPayload.slice(2).slice(argsOffset * 2, argsOffset2 * 2)}`
    const jsonAbi = new Interface(abi)
    const callFunctionSelector = jsonAbi.getFunction('complex').selectorBytes
    const selectorHex = Buffer.from(callFunctionSelector).toString('hex')
    console.log(encodedArgs, selectorHex)
  })

  afterAll(async () => {
    State.reset()
  })
})
