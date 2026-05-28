import { SPLToken2022Processor, SPL_TOKEN_2022_PROGRAM_ID } from '../builtin/index.js'

// PYUSD on Solana is issued as a Token-2022 mint (with the Transfer Hook extension).
// Replace with whatever Token-2022 mint you want to index.
const PYUSD_MINT = '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo'

// Bind to the Token-2022 program itself to receive every parsed instruction it
// processes. Filter to a specific mint inside each handler.
SPLToken2022Processor.bind({ address: SPL_TOKEN_2022_PROGRAM_ID })
  // Legacy SPL Token instructions inherited from SPLTokenProcessor:
  .onMintTo((data, ctx) => {
    if (data.mint === PYUSD_MINT) {
      ctx.meter.Counter('pyusd_supply').add(BigInt(data.amount))
    }
  })
  .onBurn((data, ctx) => {
    if (data.mint === PYUSD_MINT) {
      ctx.meter.Counter('pyusd_supply').sub(BigInt(data.amount))
    }
  })
  .onTransferChecked((data, ctx) => {
    if (data.mint === PYUSD_MINT) {
      ctx.meter.Counter('pyusd_transfer_volume').add(BigInt(data.tokenAmount.amount))
      ctx.meter.Counter('pyusd_transfer_count').add(1)
    }
  })
  // Token-2022-only instructions added by SPLToken2022Processor:
  .onInitializeTokenMetadata((data, ctx) => {
    if (data.mint === PYUSD_MINT) {
      ctx.meter.Counter('pyusd_metadata_init').add(1)
    }
  })
  .onUpdateTokenMetadataField((_data, ctx) => {
    ctx.meter.Counter('token_2022_metadata_field_updates').add(1)
  })
  .onConfidentialTransfer((data, ctx) => {
    // Confidential transfers don't expose a plaintext amount — count occurrences only.
    if (data.mint === PYUSD_MINT) {
      ctx.meter.Counter('pyusd_confidential_transfer_count').add(1)
    }
  })
  .onConfidentialTransferWithFee((data, ctx) => {
    if (data.mint === PYUSD_MINT) {
      ctx.meter.Counter('pyusd_confidential_transfer_with_fee_count').add(1)
    }
  })
