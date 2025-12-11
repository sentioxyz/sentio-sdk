import { GlobalProcessor } from '@sentio/sdk/eth'
import { Bench } from './schema/schema.js'
GlobalProcessor.bind({}).onEvent(async (log, ctx) => {
  const handlerStart = getUnixEpochUs()

  // mock data send time
  const dataSendTime = BigInt(log.blockNumber)

  const bench = new Bench({
    id: log.transactionHash,
    data: '',
    dataStart: dataSendTime,
    handlerStart: handlerStart,
    upsertStart: getUnixEpochUs()
  })
  // do not return data back
  if (!log.removed) {
    bench.data = log.data
  }

  await ctx.store.upsert(bench)

  ctx.meter.Gauge('process_end').record(getUnixEpochUs())
})

function fakeComputation(blockNumber: number) {
  let sum = 0
  for (let i = 0; i < 100000; i++) {
    sum += Number(blockNumber) * i
  }
  return sum
}

function getUnixEpochUs() {
  const timeOriginUs = BigInt(Math.floor(performance.timeOrigin * 1e3))

  // performance.now() result (a float/number in ms) has microsecond precision in some environments
  const nowUs = BigInt(Math.floor(performance.now() * 1e3))

  return timeOriginUs + nowUs
}
