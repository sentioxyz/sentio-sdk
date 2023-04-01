/* eslint-disable @typescript-eslint/no-redeclare */
// copy from https://github.com/solana-labs/solana/blob/master/explorer/src/components/instruction/token/types.ts
// https://github.com/solana-labs/explorer/blob/411b42439553262ef9036985d287a7249acaad77/src/components/instruction/token/types.ts

import {
  enums,
  type,
  Infer,
  number,
  string,
  optional,
  array,
  nullable,
  union,
  coerce,
  instance,
} from "superstruct_solana";

// Replace with string
export const PublicKeyFromString = coerce(
  instance(String),
  string(),
  (value) => (value)
);

export type TokenAmountUi = Infer<typeof TokenAmountUi>;
export type MintTo = Infer<typeof MintTo>;
export type Burn = Infer<typeof Burn>;
export type InitializeMint = Infer<typeof InitializeMint>;
export type InitializeAccount = Infer<typeof InitializeAccount>;
export type InitializeAccount2 = Infer<typeof InitializeAccount2>;
export type InitializeAccount3 = Infer<typeof InitializeAccount3>;
export type InitializeMultisig = Infer<typeof InitializeMultisig>;

export const TokenAmountUi = type({
  amount: string(),
  decimals: number(),
  uiAmountString: string(),
});

const InitializeMint = type({
  mint: PublicKeyFromString,
  decimals: number(),
  mintAuthority: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
  freezeAuthority: optional(PublicKeyFromString),
});

const InitializeAccount = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  owner: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
});

const InitializeAccount2 = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
  owner: PublicKeyFromString,
});

const InitializeAccount3 = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  owner: PublicKeyFromString,
});

const InitializeMultisig = type({
  multisig: PublicKeyFromString,
  rentSysvar: PublicKeyFromString,
  signers: array(PublicKeyFromString),
  m: number(),
});

export type Transfer = Infer<typeof Transfer>;
export const Transfer = type({
  source: PublicKeyFromString,
  destination: PublicKeyFromString,
  amount: union([string(), number()]),
  authority: optional(PublicKeyFromString),
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

export type Approve = Infer<typeof Approve>;
const Approve = type({
  source: PublicKeyFromString,
  delegate: PublicKeyFromString,
  amount: union([string(), number()]),
  owner: optional(PublicKeyFromString),
  multisigOwner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

export type Revoke = Infer<typeof Revoke>;
const Revoke = type({
  source: PublicKeyFromString,
  owner: optional(PublicKeyFromString),
  multisigOwner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

const AuthorityType = enums([
  "mintTokens",
  "freezeAccount",
  "accountOwner",
  "closeAccount",
]);

export type SetAuthority = Infer<typeof SetAuthority>;
const SetAuthority = type({
  mint: optional(PublicKeyFromString),
  account: optional(PublicKeyFromString),
  authorityType: AuthorityType,
  newAuthority: nullable(PublicKeyFromString),
  authority: optional(PublicKeyFromString),
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

const MintTo = type({
  mint: PublicKeyFromString,
  account: PublicKeyFromString,
  amount: union([string(), number()]),
  mintAuthority: optional(PublicKeyFromString),
  multisigMintAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

const Burn = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  amount: union([string(), number()]),
  authority: optional(PublicKeyFromString),
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

const CloseAccount = type({
  account: PublicKeyFromString,
  destination: PublicKeyFromString,
  owner: optional(PublicKeyFromString),
  multisigOwner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});
export type CloseAccount = Infer<typeof CloseAccount>;

export type FreezeAccount = Infer<typeof FreezeAccount>;
const FreezeAccount = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  freezeAuthority: optional(PublicKeyFromString),
  multisigFreezeAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

export type ThawAccount = Infer<typeof ThawAccount>;
const ThawAccount = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  freezeAuthority: optional(PublicKeyFromString),
  multisigFreezeAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

export type TransferChecked = Infer<typeof TransferChecked>;
export const TransferChecked = type({
  source: PublicKeyFromString,
  mint: PublicKeyFromString,
  destination: PublicKeyFromString,
  authority: optional(PublicKeyFromString),
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  tokenAmount: TokenAmountUi,
});

export type ApproveChecked = Infer<typeof ApproveChecked>;
const ApproveChecked = type({
  source: PublicKeyFromString,
  mint: PublicKeyFromString,
  delegate: PublicKeyFromString,
  owner: optional(PublicKeyFromString),
  multisigOwner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  tokenAmount: TokenAmountUi,
});

export type MintToChecked = Infer<typeof MintToChecked>;
const MintToChecked = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  mintAuthority: optional(PublicKeyFromString),
  multisigMintAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  tokenAmount: TokenAmountUi,
});

export type BurnChecked = Infer<typeof BurnChecked>;
const BurnChecked = type({
  account: PublicKeyFromString,
  mint: PublicKeyFromString,
  authority: optional(PublicKeyFromString),
  multisigAuthority: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
  tokenAmount: TokenAmountUi,
});

export type SyncNative = Infer<typeof BurnChecked>;
const SyncNative = type({
  account: PublicKeyFromString,
});

export type GetAccountDataSize = Infer<typeof GetAccountDataSize>;
const GetAccountDataSize = type({
  mint: PublicKeyFromString,
  extensionTypes: optional(array(string())),
});

export type InitializeImmutableOwner = Infer<typeof InitializeImmutableOwner>;
const InitializeImmutableOwner = type({
  account: PublicKeyFromString,
});

export type AmountToUiAmount = Infer<typeof AmountToUiAmount>;
const AmountToUiAmount = type({
  mint: PublicKeyFromString,
  amount: union([string(), number()]),
});

export type UiAmountToAmount = Infer<typeof UiAmountToAmount>;
const UiAmountToAmount = type({
  mint: PublicKeyFromString,
  uiAmount: string(),
});

export type InitializeMintCloseAuthority = Infer<typeof InitializeMintCloseAuthority>;
const InitializeMintCloseAuthority = type({
  mint: PublicKeyFromString,
  newAuthority: PublicKeyFromString,
});

export type TransferFeeExtension = Infer<typeof TransferFeeExtension>;
const TransferFeeExtension = type({
  mint: PublicKeyFromString,
  transferFeeConfigAuthority: PublicKeyFromString,
  withdrawWitheldAuthority: PublicKeyFromString,
  transferFeeBasisPoints: number(),
  maximumFee: number(),
});

export type DefaultAccountStateExtension = Infer<typeof DefaultAccountStateExtension>;
const DefaultAccountStateExtension = type({
  mint: PublicKeyFromString,
  accountState: string(),
  freezeAuthority: optional(PublicKeyFromString),
});

export type Reallocate = Infer<typeof Reallocate>;
const Reallocate = type({
  account: PublicKeyFromString,
  payer: PublicKeyFromString,
  systemProgram: PublicKeyFromString,
  extensionTypes: array(string()),
});

export type MemoTransferExtension = Infer<typeof MemoTransferExtension>;
const MemoTransferExtension = type({
  account: PublicKeyFromString,
  owner: optional(PublicKeyFromString),
  multisigOwner: optional(PublicKeyFromString),
  signers: optional(array(PublicKeyFromString)),
});

export type CreateNativeMint = Infer<typeof CreateNativeMint>;
const CreateNativeMint = type({
  payer: PublicKeyFromString,
  nativeMint: PublicKeyFromString,
  systemProgram: PublicKeyFromString,
});
