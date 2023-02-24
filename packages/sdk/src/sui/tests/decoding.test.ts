import { defaultMoveCoder } from '../move-coder.js'
import { capy, loadAllTypes } from './types/testnet/capy.js'

describe('Test Sui Example', () => {
  const coder = defaultMoveCoder()
  loadAllTypes(coder)

  test('decode 1', async () => {
    const x = coder.decodeEvent(data1) as capy.CapyBornInstance
    // console.log(JSON.stringify(x))
  })

  test('decode 2', async () => {
    const x = coder.decodeEvent(data2)
    console.log(JSON.stringify(x))
  })
})

const data1 = {
  type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::CapyBorn',
  fields: {
    id: '0x4cf7e80e056c4fde64632192b5c4d7cb61b1b449',
    parent_one: '0x74c9d026a80cf29baff53a786f3d4c48e880fa39',
    parent_two: '0x0042c9dd65d245ea834841019261d9498a167703',
    attributes: [
      {
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
        fields: { name: 'pattern', value: 'fox' },
      },
      {
        fields: { name: 'main', value: '707070' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'secondary', value: 'FEC0C2' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'emotion', value: 'sad' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      { fields: { name: 'ears', value: 'ear6' }, type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute' },
    ],
    bred_by: '0x35734d586cdc94808fb161597a2420deac5543dc',
    dev_genes: {
      fields: {
        sequence: [
          27, 88, 31, 126, 65, 156, 245, 239, 142, 56, 240, 250, 153, 25, 145, 224, 6, 106, 47, 78, 68, 179, 126, 209,
          134, 205, 203, 2, 178, 147, 131, 16,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
    gen: 2,
    genes: {
      fields: {
        sequence: [
          45, 25, 31, 194, 230, 59, 124, 48, 142, 56, 240, 241, 208, 193, 230, 224, 6, 166, 47, 78, 46, 67, 126, 209,
          134, 51, 72, 2, 156, 185, 5, 16,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
  },
  bcs: 'TPfoDgVsT95kYyGStcTXy2GxtEkCAAAAIC0ZH8LmO3wwjjjw8dDB5uAGpi9OLkN+0YYzSAKcuQUQIBtYH35BnPXvjjjw+pkZkeAGai9ORLN+0YbNywKyk4MQBQdwYXR0ZXJuA2ZveARtYWluBjcwNzA3MAlzZWNvbmRhcnkGRkVDMEMyB2Vtb3Rpb24Dc2FkBGVhcnMEZWFyNgF0ydAmqAzym6/1OnhvPUxI6ID6OQEAQsndZdJF6oNIQQGSYdlJihZ3AzVzTVhs3JSAj7FhWXokIN6sVUPc',
  packageId: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93',
  transactionModule: 'capy',
  sender: '0x35734d586cdc94808fb161597a2420deac5543dc',
  data: {
    id: '0x4cf7e80e056c4fde64632192b5c4d7cb61b1b449',
    parent_one: '0x74c9d026a80cf29baff53a786f3d4c48e880fa39',
    parent_two: '0x0042c9dd65d245ea834841019261d9498a167703',
    attributes: [
      {
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
        fields: { name: 'pattern', value: 'fox' },
      },
      {
        fields: { name: 'main', value: '707070' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'secondary', value: 'FEC0C2' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'emotion', value: 'sad' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      { fields: { name: 'ears', value: 'ear6' }, type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute' },
    ],
    bred_by: '0x35734d586cdc94808fb161597a2420deac5543dc',
    dev_genes: {
      fields: {
        sequence: [
          27, 88, 31, 126, 65, 156, 245, 239, 142, 56, 240, 250, 153, 25, 145, 224, 6, 106, 47, 78, 68, 179, 126, 209,
          134, 205, 203, 2, 178, 147, 131, 16,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
    gen: 2,
    genes: {
      fields: {
        sequence: [
          45, 25, 31, 194, 230, 59, 124, 48, 142, 56, 240, 241, 208, 193, 230, 224, 6, 166, 47, 78, 46, 67, 126, 209,
          134, 51, 72, 2, 156, 185, 5, 16,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
  },
}

const data2 = {
  fields: {
    id: '0x84657f327bb5643615a41c21adc3f860027f60bd',
    parent_one: '0x165a1720c2a7741b2250549d480c9151bc766ce7',
    parent_two: '0x8398f2e36dc22dbd9bd51759720a2b4d00aa3724',
    attributes: [
      {
        fields: { name: 'pattern', value: 'basic' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'main', value: 'DA8E2F' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'secondary', value: 'D5CBB1' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
        fields: { name: 'emotion', value: 'astonished' },
      },
      { type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute', fields: { value: 'ear4', name: 'ears' } },
    ],
    bred_by: '0xc5bdaea91985316ffc06afa3f4e3139683d5b59e',
    dev_genes: {
      fields: {
        sequence: [
          27, 60, 252, 194, 230, 59, 233, 252, 193, 56, 240, 214, 80, 200, 136, 100, 117, 175, 47, 78, 50, 69, 126, 209,
          100, 205, 148, 108, 74, 0, 18, 85,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
    gen: 1,
    genes: {
      fields: {
        sequence: [
          193, 60, 119, 78, 152, 93, 233, 252, 193, 245, 240, 214, 100, 200, 145, 100, 247, 175, 212, 76, 50, 67, 126,
          64, 138, 108, 148, 165, 156, 147, 18, 16,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
  },
  bcs: 'hGV/Mnu1ZDYVpBwhrcP4YAJ/YL0BAAAAIME8d06YXen8wfXw1mTIkWT3r9RMMkN+QIpslKWckxIQIBs8/MLmO+n8wTjw1lDIiGR1ry9OMkV+0WTNlGxKABJVBQdwYXR0ZXJuBWJhc2ljBG1haW4GREE4RTJGCXNlY29uZGFyeQZENUNCQjEHZW1vdGlvbgphc3RvbmlzaGVkBGVhcnMEZWFyNAEWWhcgwqd0GyJQVJ1IDJFRvHZs5wGDmPLjbcItvZvVF1lyCitNAKo3JMW9rqkZhTFv/Aavo/TjE5aD1bWe',
  packageId: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93',
  transactionModule: 'eden',
  sender: '0xc5bdaea91985316ffc06afa3f4e3139683d5b59e',
  type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::CapyBorn',
  data: {
    id: '0x84657f327bb5643615a41c21adc3f860027f60bd',
    parent_one: '0x165a1720c2a7741b2250549d480c9151bc766ce7',
    parent_two: '0x8398f2e36dc22dbd9bd51759720a2b4d00aa3724',
    attributes: [
      {
        fields: { name: 'pattern', value: 'basic' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'main', value: 'DA8E2F' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        fields: { name: 'secondary', value: 'D5CBB1' },
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
      },
      {
        type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute',
        fields: { name: 'emotion', value: 'astonished' },
      },
      { type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Attribute', fields: { value: 'ear4', name: 'ears' } },
    ],
    bred_by: '0xc5bdaea91985316ffc06afa3f4e3139683d5b59e',
    dev_genes: {
      fields: {
        sequence: [
          27, 60, 252, 194, 230, 59, 233, 252, 193, 56, 240, 214, 80, 200, 136, 100, 117, 175, 47, 78, 50, 69, 126, 209,
          100, 205, 148, 108, 74, 0, 18, 85,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
    gen: 1,
    genes: {
      fields: {
        sequence: [
          193, 60, 119, 78, 152, 93, 233, 252, 193, 245, 240, 214, 100, 200, 145, 100, 247, 175, 212, 76, 50, 67, 126,
          64, 138, 108, 148, 165, 156, 147, 18, 16,
        ],
      },
      type: '0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::Genes',
    },
  },
}
