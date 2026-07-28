import { describe, test } from 'node:test'
import assert from 'assert'
import { create } from '@bufbuild/protobuf'
import { DataBindingSchema } from '@sentio/protos'
import { describeBindingData } from './handler-descriptor.js'

// Every chain must identify its trigger, not just EVM: without it a report says only
// "this handler, sometime", which is not reproducible. Most chains carry it in
// structured fields; only EVM hides it inside raw JSON.
describe('describeBindingData across chains', () => {
  const of = (value: any) => describeBindingData(create(DataBindingSchema, { data: { value } }))

  test('evm decodes the hex block number and short hash', () => {
    assert.equal(
      of({ case: 'ethBlock', value: { rawBlock: JSON.stringify({ number: '0x31a3f04', hash: '0xdad000ab1234' }) } }),
      'block 52051716 hash 0xdad000ab'
    )
  })

  test('evm log adds transaction and log index', () => {
    const raw = JSON.stringify({ blockNumber: '0x10', transactionHash: '0xabc', logIndex: '0x2' })
    assert.equal(of({ case: 'ethLog', value: { rawLog: raw } }), 'block 16 tx 0xabc log 2')
  })

  test('solana reports slot and program', () => {
    assert.equal(
      of({ case: 'solInstruction', value: { slot: 123n, programAccountId: 'Prog111', instructionData: '' } }),
      'slot 123 program Prog111'
    )
    assert.equal(of({ case: 'solBlock', value: { slot: 9n, rawBlock: '' } }), 'slot 9')
  })

  test('aptos reports the ledger version', () => {
    assert.equal(of({ case: 'aptResource', value: { version: 77n, rawResources: [] } }), 'version 77')
    assert.equal(
      of({ case: 'aptCall', value: { rawTransaction: JSON.stringify({ version: '4242' }) } }),
      'version 4242'
    )
  })

  test('sui reports the checkpoint and the object', () => {
    assert.equal(of({ case: 'suiCall', value: { slot: 500n, rawTransaction: '' } }), 'checkpoint 500')
    assert.equal(
      of({ case: 'suiObject', value: { slot: 501n, objectId: '0xobj', objectVersion: 7n, rawObjects: [] } }),
      'checkpoint 501 object 0xobj version 7'
    )
    assert.equal(
      of({ case: 'suiObjectChange', value: { slot: 502n, txDigest: 'DIG', rawChanges: [] } }),
      'checkpoint 502 tx DIG'
    )
  })

  test('fuel reports the receipt index', () => {
    assert.equal(of({ case: 'fuelReceipt', value: { receiptIndex: 4n } }), 'receipt 4')
  })

  test('unreadable or absent payloads yield nothing rather than a guess', () => {
    assert.equal(of({ case: 'ethBlock', value: { rawBlock: 'not json' } }), undefined)
    assert.equal(describeBindingData(create(DataBindingSchema, {})), undefined)
  })
})
