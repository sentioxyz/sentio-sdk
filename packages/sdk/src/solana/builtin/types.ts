/* eslint-disable @typescript-eslint/no-redeclare */
// Synced from https://github.com/solana-foundation/explorer/blob/master/app/components/instruction/token/types.ts
// Local `PublicKeyFromString` is a string-coercing variant (we use kit's `Address` branded
// string instead of v1's `PublicKey` class), so the import is replaced. Everything else
// mirrors the upstream JSON-parsed shape produced by Solana RPC's `jsonParsed` encoding.

import {
  array,
  boolean,
  coerce,
  enums,
  Infer,
  instance,
  nullable,
  number,
  optional,
  string,
  type,
  union,
} from 'superstruct'

export const PublicKeyFromString = coerce(instance(String), string(), (value) => value)

export type TokenAmountUi = Infer<typeof TokenAmountUi>
export const TokenAmountUi = type({
  amount: string(),
  decimals: number(),
  uiAmountString: string(),
})

export type InitializeMint = Infer<typeof InitializeMint>
export const InitializeMint = type({
  decimals: number(),
  freezeAuthority: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  mintAuthority: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
})

export type InitializeMint2 = Infer<typeof InitializeMint2>
export const InitializeMint2 = type({
  decimals: number(),
  freezeAuthority: PublicKeyFromString,
  freezeAuthorityOption: optional(number()),
  mint: PublicKeyFromString,
  mintAuthority: PublicKeyFromString,
})

export type InitializeAccount = Infer<typeof InitializeAccount>
export const InitializeAccount = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  owner: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
})

export type InitializeAccount2 = Infer<typeof InitializeAccount2>
export const InitializeAccount2 = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  owner: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
})

export type InitializeAccount3 = Infer<typeof InitializeAccount3>
export const InitializeAccount3 = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  owner: PublicKeyFromString,
})

export type InitializeMultisig = Infer<typeof InitializeMultisig>
export const InitializeMultisig = type({
  m: number(),
  multisig: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
  signers: array(PublicKeyFromString),
})

export type Transfer = Infer<typeof Transfer>
export const Transfer = type({
  amount: union([string(), number()]),
  authority: optional(PublicKeyFromString),
  destination: PublicKeyFromString,
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
})

export type Approve = Infer<typeof Approve>
export const Approve = type({
  amount: union([string(), number()]),
  delegate: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
})

export type Revoke = Infer<typeof Revoke>
export const Revoke = type({
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
})

const AuthorityType = enums(['mintTokens', 'freezeAccount', 'accountOwner', 'closeAccount'])

export type SetAuthority = Infer<typeof SetAuthority>
export const SetAuthority = type({
  account: optional(PublicKeyFromString),
  authority: optional(PublicKeyFromString),
  authorityType: AuthorityType,
  mint: optional(PublicKeyFromString),
  multisigAuthority: optional(PublicKeyFromString),
  newAuthority: nullable(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type MintTo = Infer<typeof MintTo>
export const MintTo = type({
  account: PublicKeyFromString,
  amount: union([string(), number()]),
  mint: PublicKeyFromString,
  mintAuthority: optional(PublicKeyFromString),
  multisigMintAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type Burn = Infer<typeof Burn>
export const Burn = type({
  account: PublicKeyFromString,
  amount: union([string(), number()]),
  authority: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type CloseAccount = Infer<typeof CloseAccount>
export const CloseAccount = type({
  account: PublicKeyFromString,
  destination: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type FreezeAccount = Infer<typeof FreezeAccount>
export const FreezeAccount = type({
  account: PublicKeyFromString,
  freezeAuthority: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  multisigFreezeAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type ThawAccount = Infer<typeof ThawAccount>
export const ThawAccount = type({
  account: PublicKeyFromString,
  freezeAuthority: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  multisigFreezeAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type TransferChecked = Infer<typeof TransferChecked>
export const TransferChecked = type({
  authority: optional(PublicKeyFromString),
  destination: PublicKeyFromString,
  mint: PublicKeyFromString,
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
  tokenAmount: TokenAmountUi,
})

export type ApproveChecked = Infer<typeof ApproveChecked>
export const ApproveChecked = type({
  delegate: PublicKeyFromString,
  mint: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
  tokenAmount: TokenAmountUi,
})

export type MintToChecked = Infer<typeof MintToChecked>
export const MintToChecked = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  mintAuthority: optional(PublicKeyFromString),
  multisigMintAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  tokenAmount: TokenAmountUi,
})

export type BurnChecked = Infer<typeof BurnChecked>
export const BurnChecked = type({
  account: PublicKeyFromString,
  authority: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  tokenAmount: TokenAmountUi,
})

export type SyncNative = Infer<typeof SyncNative>
export const SyncNative = type({
  account: PublicKeyFromString,
})

export type GetAccountDataSize = Infer<typeof GetAccountDataSize>
export const GetAccountDataSize = type({
  extensionTypes: optional(array(string())),
  mint: PublicKeyFromString,
})

export type InitializeImmutableOwner = Infer<typeof InitializeImmutableOwner>
export const InitializeImmutableOwner = type({
  account: PublicKeyFromString,
})

export type AmountToUiAmount = Infer<typeof AmountToUiAmount>
export const AmountToUiAmount = type({
  amount: union([string(), number()]),
  mint: PublicKeyFromString,
})

export type UiAmountToAmount = Infer<typeof UiAmountToAmount>
export const UiAmountToAmount = type({
  mint: PublicKeyFromString,
  uiAmount: string(),
})

export type InitializeMintCloseAuthority = Infer<typeof InitializeMintCloseAuthority>
export const InitializeMintCloseAuthority = type({
  mint: PublicKeyFromString,
  newAuthority: PublicKeyFromString,
})

export type TransferFeeExtension = Infer<typeof TransferFeeExtension>
export const TransferFeeExtension = type({
  maximumFee: number(),
  mint: PublicKeyFromString,
  transferFeeBasisPoints: number(),
  transferFeeConfigAuthority: PublicKeyFromString,
  withdrawWitheldAuthority: PublicKeyFromString,
})

export type DefaultAccountStateExtension = Infer<typeof DefaultAccountStateExtension>
export const DefaultAccountStateExtension = type({
  accountState: string(),
  freezeAuthority: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
})

export type Reallocate = Infer<typeof Reallocate>
export const Reallocate = type({
  account: PublicKeyFromString,
  extensionTypes: array(string()),
  payer: PublicKeyFromString,
  systemProgram: PublicKeyFromString,
})

export type MemoTransferExtension = Infer<typeof MemoTransferExtension>
export const MemoTransferExtension = type({
  account: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type CreateNativeMint = Infer<typeof CreateNativeMint>
export const CreateNativeMint = type({
  nativeMint: PublicKeyFromString,
  payer: PublicKeyFromString,
  systemProgram: PublicKeyFromString,
})

export type InitializeMetadataPointerInfo = Infer<typeof InitializeMetadataPointer>
export const InitializeMetadataPointer = type({
  authority: PublicKeyFromString,
  metadataAddress: PublicKeyFromString,
  mint: PublicKeyFromString,
})

export type InitializeGroupMemberPointerInfo = Infer<typeof InitializeGroupMemberPointer>
export const InitializeGroupMemberPointer = type({
  authority: PublicKeyFromString,
  memberAddress: PublicKeyFromString,
  mint: PublicKeyFromString,
})

export type InitializeNonTransferableMint = Infer<typeof InitializeNonTransferableMint>
export const InitializeNonTransferableMint = type({
  mint: PublicKeyFromString,
})

export type InitializePermanentDelegate = Infer<typeof InitializePermanentDelegate>
export const InitializePermanentDelegate = type({
  delegate: PublicKeyFromString,
  mint: PublicKeyFromString,
})

export type InitializeTokenMetadataInfo = Infer<typeof InitializeTokenMetadata>
export const InitializeTokenMetadata = type({
  metadata: PublicKeyFromString,
  mint: PublicKeyFromString,
  mintAuthority: PublicKeyFromString,
  name: string(),
  symbol: string(),
  updateAuthority: PublicKeyFromString,
  uri: string(),
})

export type UpdateTokenMetadataFieldInfo = Infer<typeof UpdateTokenMetadataField>
export const UpdateTokenMetadataField = type({
  field: string(),
  metadata: PublicKeyFromString,
  updateAuthority: PublicKeyFromString,
  value: string(),
})

export type RemoveTokenMetadataKeyInfo = Infer<typeof RemoveTokenMetadataKey>
export const RemoveTokenMetadataKey = type({
  idempotent: optional(boolean()),
  key: string(),
  metadata: PublicKeyFromString,
  updateAuthority: PublicKeyFromString,
})

export type UpdateTokenMetadataUpdateAuthorityInfo = Infer<typeof UpdateTokenMetadataUpdateAuthority>
export const UpdateTokenMetadataUpdateAuthority = type({
  metadata: PublicKeyFromString,
  newUpdateAuthority: PublicKeyFromString,
  updateAuthority: PublicKeyFromString,
})

export type UpdateTokenMetadataAuthorityInfo = Infer<typeof UpdateTokenMetadataAuthority>
export const UpdateTokenMetadataAuthority = type({
  metadata: PublicKeyFromString,
  newAuthority: PublicKeyFromString,
  updateAuthority: PublicKeyFromString,
})

export type EmitTokenMetadataInfo = Infer<typeof EmitTokenMetadata>
export const EmitTokenMetadata = type({
  end: optional(nullable(number())),
  metadata: PublicKeyFromString,
  start: optional(nullable(number())),
})

export type UpdateMetadataPointerInfo = Infer<typeof UpdateMetadataPointer>
export const UpdateMetadataPointer = type({
  authority: PublicKeyFromString,
  metadataAddress: optional(nullable(PublicKeyFromString)),
  mint: PublicKeyFromString,
})

export type InitializeGroupPointerInfo = Infer<typeof InitializeGroupPointer>
export const InitializeGroupPointer = type({
  authority: PublicKeyFromString,
  groupAddress: PublicKeyFromString,
  mint: PublicKeyFromString,
})

export type UpdateGroupPointerInfo = Infer<typeof UpdateGroupPointer>
export const UpdateGroupPointer = type({
  authority: PublicKeyFromString,
  groupAddress: optional(nullable(PublicKeyFromString)),
  mint: PublicKeyFromString,
})

export type UpdateGroupMemberPointerInfo = Infer<typeof UpdateGroupMemberPointer>
export const UpdateGroupMemberPointer = type({
  authority: PublicKeyFromString,
  memberAddress: optional(nullable(PublicKeyFromString)),
  mint: PublicKeyFromString,
})

export type InitializeTokenGroupInfo = Infer<typeof InitializeTokenGroup>
export const InitializeTokenGroup = type({
  group: PublicKeyFromString,
  maxSize: number(),
  mint: PublicKeyFromString,
  mintAuthority: PublicKeyFromString,
  updateAuthority: PublicKeyFromString,
})

export type UpdateTokenGroupMaxSizeInfo = Infer<typeof UpdateTokenGroupMaxSize>
export const UpdateTokenGroupMaxSize = type({
  group: PublicKeyFromString,
  maxSize: number(),
  updateAuthority: PublicKeyFromString,
})

export type UpdateTokenGroupUpdateAuthorityInfo = Infer<typeof UpdateTokenGroupUpdateAuthority>
export const UpdateTokenGroupUpdateAuthority = type({
  group: PublicKeyFromString,
  newUpdateAuthority: PublicKeyFromString,
  updateAuthority: PublicKeyFromString,
})

export type InitializeTokenGroupMemberInfo = Infer<typeof InitializeTokenGroupMember>
export const InitializeTokenGroupMember = type({
  group: PublicKeyFromString,
  groupUpdateAuthority: PublicKeyFromString,
  member: PublicKeyFromString,
  memberMint: PublicKeyFromString,
  memberMintAuthority: PublicKeyFromString,
})

// Confidential Transfer extension instructions (Token-2022).
// JSON shapes mirror agave/transaction-status/src/parse_token/extension/confidential_transfer.rs.

export type InitializeConfidentialTransferMint = Infer<typeof InitializeConfidentialTransferMint>
export const InitializeConfidentialTransferMint = type({
  auditorElGamalPubkey: nullable(string()),
  authority: optional(PublicKeyFromString),
  autoApproveNewAccounts: boolean(),
  mint: PublicKeyFromString,
})

export type UpdateConfidentialTransferMint = Infer<typeof UpdateConfidentialTransferMint>
export const UpdateConfidentialTransferMint = type({
  auditorElGamalPubkey: nullable(string()),
  autoApproveNewAccounts: boolean(),
  confidentialTransferMintAuthority: PublicKeyFromString,
  mint: PublicKeyFromString,
})

export type ConfigureConfidentialTransferAccount = Infer<typeof ConfigureConfidentialTransferAccount>
export const ConfigureConfidentialTransferAccount = type({
  account: PublicKeyFromString,
  decryptableZeroBalance: string(),
  instructionsSysvar: optional(PublicKeyFromString),
  maximumPendingBalanceCreditCounter: union([string(), number()]),
  mint: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  proofContextStateAccount: optional(PublicKeyFromString),
  proofInstructionOffset: number(),
  recordAccount: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type ApproveConfidentialTransferAccount = Infer<typeof ApproveConfidentialTransferAccount>
export const ApproveConfidentialTransferAccount = type({
  account: PublicKeyFromString,
  confidentialTransferAuditorAuthority: PublicKeyFromString,
  mint: PublicKeyFromString,
})

export type EmptyConfidentialTransferAccount = Infer<typeof EmptyConfidentialTransferAccount>
export const EmptyConfidentialTransferAccount = type({
  account: PublicKeyFromString,
  instructionsSysvar: optional(PublicKeyFromString),
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  proofContextStateAccount: optional(PublicKeyFromString),
  proofInstructionOffset: number(),
  recordAccount: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type DepositConfidentialTransfer = Infer<typeof DepositConfidentialTransfer>
export const DepositConfidentialTransfer = type({
  amount: union([string(), number()]),
  decimals: number(),
  destination: PublicKeyFromString,
  mint: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
})

export type WithdrawConfidentialTransfer = Infer<typeof WithdrawConfidentialTransfer>
export const WithdrawConfidentialTransfer = type({
  amount: union([string(), number()]),
  decimals: number(),
  destination: PublicKeyFromString,
  equalityProofContextStateAccount: optional(PublicKeyFromString),
  equalityProofInstructionOffset: number(),
  equalityProofRecordAccount: optional(PublicKeyFromString),
  instructionsSysvar: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  newDecryptableAvailableBalance: string(),
  owner: optional(PublicKeyFromString),
  rangeProofContextStateAccount: optional(PublicKeyFromString),
  rangeProofInstructionOffset: number(),
  rangeProofRecordAccount: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
})

export type ConfidentialTransfer = Infer<typeof ConfidentialTransfer>
export const ConfidentialTransfer = type({
  ciphertextValidityProofContextStateAccount: optional(PublicKeyFromString),
  ciphertextValidityProofInstructionOffset: number(),
  ciphertextValidityProofRecordAccount: optional(PublicKeyFromString),
  destination: PublicKeyFromString,
  equalityProofContextStateAccount: optional(PublicKeyFromString),
  equalityProofInstructionOffset: number(),
  equalityProofRecordAccount: optional(PublicKeyFromString),
  instructionsSysvar: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  newSourceDecryptableAvailableBalance: string(),
  owner: optional(PublicKeyFromString),
  rangeProofContextStateAccount: optional(PublicKeyFromString),
  rangeProofInstructionOffset: number(),
  rangeProofRecordAccount: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
})

export type ConfidentialTransferWithFee = Infer<typeof ConfidentialTransferWithFee>
export const ConfidentialTransferWithFee = type({
  destination: PublicKeyFromString,
  equalityProofContextStateAccount: optional(PublicKeyFromString),
  equalityProofInstructionOffset: number(),
  equalityProofRecordAccount: optional(PublicKeyFromString),
  feeCiphertextValidityProofContextStateAccount: optional(PublicKeyFromString),
  feeCiphertextValidityProofInstructionOffset: number(),
  feeCiphertextValidityProofRecordAccount: optional(PublicKeyFromString),
  feeSigmaProofContextStateAccount: optional(PublicKeyFromString),
  feeSigmaProofInstructionOffset: number(),
  feeSigmaProofRecordAccount: optional(PublicKeyFromString),
  instructionsSysvar: optional(PublicKeyFromString),
  mint: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  newSourceDecryptableAvailableBalance: string(),
  owner: optional(PublicKeyFromString),
  rangeProofContextStateAccount: optional(PublicKeyFromString),
  rangeProofInstructionOffset: number(),
  rangeProofRecordAccount: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
  transferAmountCiphertextValidityProofContextStateAccount: optional(PublicKeyFromString),
  transferAmountCiphertextValidityProofInstructionOffset: number(),
  transferAmountCiphertextValidityProofRecordAccount: optional(PublicKeyFromString),
})

export type ApplyPendingConfidentialTransferBalance = Infer<typeof ApplyPendingConfidentialTransferBalance>
export const ApplyPendingConfidentialTransferBalance = type({
  account: PublicKeyFromString,
  expectedPendingBalanceCreditCounter: union([string(), number()]),
  multisigOwner: optional(PublicKeyFromString),
  newDecryptableAvailableBalance: string(),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type ConfidentialTransferCreditsToggle = Infer<typeof ConfidentialTransferCreditsToggle>
export const ConfidentialTransferCreditsToggle = type({
  account: PublicKeyFromString,
  multisigOwner: optional(PublicKeyFromString),
  owner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
})

export type ConfigureConfidentialAccountWithRegistry = Infer<typeof ConfigureConfidentialAccountWithRegistry>
export const ConfigureConfidentialAccountWithRegistry = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  registry: PublicKeyFromString,
})

export type WithdrawExcessLamports = Infer<typeof WithdrawExcessLamports>
export const WithdrawExcessLamports = type({
  authority: optional(PublicKeyFromString),
  destination: PublicKeyFromString,
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  source: PublicKeyFromString,
})

export type TokenInstructionType = Infer<typeof TokenInstructionType>
export const TokenInstructionType = enums([
  'initializeMint',
  'initializeMint2',
  'initializeAccount',
  'initializeAccount2',
  'initializeAccount3',
  'initializeGroupMemberPointer',
  'initializeMultisig',
  'initializeNonTransferableMint',
  'initializeTokenGroupMember',
  'initializeTokenMetadata',
  'initializePermanentDelegate',
  'initializeMetadataPointer',
  'transfer',
  'approve',
  'revoke',
  'setAuthority',
  'mintTo',
  'burn',
  'closeAccount',
  'freezeAccount',
  'thawAccount',
  'transfer2',
  'approve2',
  'mintTo2',
  'burn2',
  'transferChecked',
  'approveChecked',
  'mintToChecked',
  'burnChecked',
  'syncNative',
  'getAccountDataSize',
  'initializeImmutableOwner',
  'amountToUiAmount',
  'uiAmountToAmount',
  'initializeMintCloseAuthority',
  'transferFeeExtension',
  'defaultAccountStateExtension',
  'reallocate',
  'memoTransferExtension',
  'updateTokenMetadataField',
  'removeTokenMetadataKey',
  'updateTokenMetadataAuthority',
  'updateTokenMetadataUpdateAuthority',
  'emitTokenMetadata',
  'updateMetadataPointer',
  'initializeGroupPointer',
  'updateGroupPointer',
  'updateGroupMemberPointer',
  'initializeTokenGroup',
  'updateTokenGroupMaxSize',
  'updateTokenGroupUpdateAuthority',
  'createNativeMint',
  'initializeConfidentialTransferMint',
  'updateConfidentialTransferMint',
  'configureConfidentialTransferAccount',
  'approveConfidentialTransferAccount',
  'emptyConfidentialTransferAccount',
  'depositConfidentialTransfer',
  'withdrawConfidentialTransfer',
  'confidentialTransfer',
  'confidentialTransferWithFee',
  'applyPendingConfidentialTransferBalance',
  'enableConfidentialTransferConfidentialCredits',
  'disableConfidentialTransferConfidentialCredits',
  'enableConfidentialTransferNonConfidentialCredits',
  'disableConfidentialTransferNonConfidentialCredits',
  'configureConfidentialAccountWithRegistry',
  'withdrawExcessLamports',
])

export const IX_STRUCTS = {
  amountToUiAmount: AmountToUiAmount,
  applyPendingConfidentialTransferBalance: ApplyPendingConfidentialTransferBalance,
  approve: Approve,
  approve2: ApproveChecked,
  approveChecked: ApproveChecked,
  approveConfidentialTransferAccount: ApproveConfidentialTransferAccount,
  burn: Burn,
  burn2: BurnChecked,
  burnChecked: BurnChecked,
  closeAccount: CloseAccount,
  confidentialTransfer: ConfidentialTransfer,
  confidentialTransferWithFee: ConfidentialTransferWithFee,
  configureConfidentialAccountWithRegistry: ConfigureConfidentialAccountWithRegistry,
  configureConfidentialTransferAccount: ConfigureConfidentialTransferAccount,
  createNativeMint: CreateNativeMint,
  defaultAccountStateExtension: DefaultAccountStateExtension,
  depositConfidentialTransfer: DepositConfidentialTransfer,
  disableConfidentialTransferConfidentialCredits: ConfidentialTransferCreditsToggle,
  disableConfidentialTransferNonConfidentialCredits: ConfidentialTransferCreditsToggle,
  emitTokenMetadata: EmitTokenMetadata,
  emptyConfidentialTransferAccount: EmptyConfidentialTransferAccount,
  enableConfidentialTransferConfidentialCredits: ConfidentialTransferCreditsToggle,
  enableConfidentialTransferNonConfidentialCredits: ConfidentialTransferCreditsToggle,
  freezeAccount: FreezeAccount,
  getAccountDataSize: GetAccountDataSize,
  initializeAccount: InitializeAccount,
  initializeAccount2: InitializeAccount2,
  initializeAccount3: InitializeAccount3,
  initializeConfidentialTransferMint: InitializeConfidentialTransferMint,
  initializeGroupMemberPointer: InitializeGroupMemberPointer,
  initializeGroupPointer: InitializeGroupPointer,
  initializeImmutableOwner: InitializeImmutableOwner,
  initializeMetadataPointer: InitializeMetadataPointer,
  initializeMint: InitializeMint,
  initializeMint2: InitializeMint2,
  initializeMintCloseAuthority: InitializeMintCloseAuthority,
  initializeMultisig: InitializeMultisig,
  initializeNonTransferableMint: InitializeNonTransferableMint,
  initializePermanentDelegate: InitializePermanentDelegate,
  initializeTokenGroup: InitializeTokenGroup,
  initializeTokenGroupMember: InitializeTokenGroupMember,
  initializeTokenMetadata: InitializeTokenMetadata,
  memoTransferExtension: MemoTransferExtension,
  mintTo: MintTo,
  mintTo2: MintToChecked,
  mintToChecked: MintToChecked,
  reallocate: Reallocate,
  removeTokenMetadataKey: RemoveTokenMetadataKey,
  revoke: Revoke,
  setAuthority: SetAuthority,
  syncNative: SyncNative,
  thawAccount: ThawAccount,
  transfer: Transfer,
  transfer2: TransferChecked,
  transferChecked: TransferChecked,
  transferFeeExtension: TransferFeeExtension,
  uiAmountToAmount: UiAmountToAmount,
  updateConfidentialTransferMint: UpdateConfidentialTransferMint,
  updateGroupMemberPointer: UpdateGroupMemberPointer,
  updateGroupPointer: UpdateGroupPointer,
  updateMetadataPointer: UpdateMetadataPointer,
  updateTokenGroupMaxSize: UpdateTokenGroupMaxSize,
  updateTokenGroupUpdateAuthority: UpdateTokenGroupUpdateAuthority,
  updateTokenMetadataAuthority: UpdateTokenMetadataAuthority,
  updateTokenMetadataField: UpdateTokenMetadataField,
  updateTokenMetadataUpdateAuthority: UpdateTokenMetadataUpdateAuthority,
  withdrawConfidentialTransfer: WithdrawConfidentialTransfer,
  withdrawExcessLamports: WithdrawExcessLamports,
}

export const IX_TITLES = {
  amountToUiAmount: 'Amount To UiAmount',
  applyPendingConfidentialTransferBalance: 'Apply Pending Confidential Transfer Balance',
  approve: 'Approve',
  approve2: 'Approve (Checked)',
  approveChecked: 'Approve (Checked)',
  approveConfidentialTransferAccount: 'Approve Confidential Transfer Account',
  burn: 'Burn',
  burn2: 'Burn (Checked)',
  burnChecked: 'Burn (Checked)',
  closeAccount: 'Close Account',
  confidentialTransfer: 'Confidential Transfer',
  confidentialTransferWithFee: 'Confidential Transfer With Fee',
  configureConfidentialAccountWithRegistry: 'Configure Confidential Account With Registry',
  configureConfidentialTransferAccount: 'Configure Confidential Transfer Account',
  createNativeMint: 'Create Native Mint',
  defaultAccountStateExtension: 'Default Account State Extension',
  depositConfidentialTransfer: 'Deposit Confidential Transfer',
  disableConfidentialTransferConfidentialCredits: 'Disable Confidential Credits',
  disableConfidentialTransferNonConfidentialCredits: 'Disable Non-Confidential Credits',
  emitTokenMetadata: 'Emit Token Metadata',
  emptyConfidentialTransferAccount: 'Empty Confidential Transfer Account',
  enableConfidentialTransferConfidentialCredits: 'Enable Confidential Credits',
  enableConfidentialTransferNonConfidentialCredits: 'Enable Non-Confidential Credits',
  freezeAccount: 'Freeze Account',
  getAccountDataSize: 'Get Account Data Size',
  initializeAccount: 'Initialize Account',
  initializeAccount2: 'Initialize Account (2)',
  initializeAccount3: 'Initialize Account (3)',
  initializeConfidentialTransferMint: 'Initialize Confidential Transfer Mint',
  initializeGroupMemberPointer: 'Initialize Group Member Pointer',
  initializeGroupPointer: 'Initialize Group Pointer',
  initializeImmutableOwner: 'Initialize Immutable Owner',
  initializeMetadataPointer: 'Initialize Metadata Pointer',
  initializeMint: 'Initialize Mint',
  initializeMint2: 'Initialize Mint (2)',
  initializeMintCloseAuthority: 'Initialize Mint Close Authority',
  initializeMultisig: 'Initialize Multisig',
  initializeNonTransferableMint: 'Initialize Non-Transferable Mint',
  initializePermanentDelegate: 'Initialize Permanent Delegate',
  initializeTokenGroup: 'Initialize Token Group',
  initializeTokenGroupMember: 'Initialize Token Group Member',
  initializeTokenMetadata: 'Initialize Token Metadata',
  memoTransferExtension: 'Memo Transfer Extension',
  mintTo: 'Mint To',
  mintTo2: 'Mint To (Checked)',
  mintToChecked: 'Mint To (Checked)',
  reallocate: 'Reallocate',
  removeTokenMetadataKey: 'Remove Token Metadata Key',
  revoke: 'Revoke',
  setAuthority: 'Set Authority',
  syncNative: 'Sync Native',
  thawAccount: 'Thaw Account',
  transfer: 'Transfer',
  transfer2: 'Transfer (Checked)',
  transferChecked: 'Transfer (Checked)',
  transferFeeExtension: 'Transfer Fee Extension',
  uiAmountToAmount: 'UiAmount To Amount',
  updateConfidentialTransferMint: 'Update Confidential Transfer Mint',
  updateGroupMemberPointer: 'Update Group Member Pointer',
  updateGroupPointer: 'Update Group Pointer',
  updateMetadataPointer: 'Update Metadata Pointer',
  updateTokenGroupMaxSize: 'Update Token Group Max Size',
  updateTokenGroupUpdateAuthority: 'Update Token Group Update Authority',
  updateTokenMetadataAuthority: 'Update Token Metadata Authority',
  updateTokenMetadataField: 'Update Token Metadata Field',
  updateTokenMetadataUpdateAuthority: 'Update Token Metadata Update Authority',
  withdrawConfidentialTransfer: 'Withdraw Confidential Transfer',
  withdrawExcessLamports: 'Withdraw Excess Lamports',
}
