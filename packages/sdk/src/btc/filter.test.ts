import { TransactionFilter } from './filter.js'

const stakingFilter: TransactionFilter = {
  filter: [{ block_number: { gte: 850000 } }],
  outputFilter: {
    vout_index: 1,
    script_asm: { prefix: 'OP_RETURN 62626e31' }
  }
}

const outboundFilter: TransactionFilter = {
  filter: [{ block_number: { gte: 850000 } }],
  inputFilter: {
    preTransaction: {
      outputFilter: {
        vout_index: { eq: 1 },
        script_asm: { prefix: 'OP_RETURN 62626e31' }
      }
    }
  }
}
