import { MoveModule } from '../move-types.js'
import { parseMoveType, TypeDescriptor } from '../types.js'
import { moduleQname, moduleQnameForType, SPLITTER, VECTOR_STR } from '../utils.js'

function generateTypeForDescriptor(type: TypeDescriptor, currentAddress: string): string {
  // TODO &signer is defintely an address, but what if &OTHER_TYPE?
  if (type.qname.startsWith('&')) {
    return 'Address'
  }

  switch (type.qname) {
    case 'signer': // TODO check this
    case 'address':
      return 'Address'
    case '0x1::string::String':
      return 'string'
    case 'bool':
      return 'Boolean'
    case 'u8':
    case 'u16':
    case 'u32':
      return 'number'
    case 'u64':
    case 'u128':
      return 'bigint'
  }

  if (type.qname === VECTOR_STR) {
    // vector<u8> as hex string
    const elementTypeQname = type.typeArgs[0].qname
    if (elementTypeQname === 'u8') {
      return 'string'
    }
    if (elementTypeQname.startsWith('T') && !elementTypeQname.includes(SPLITTER)) {
      return `${elementTypeQname}[] | string`
    }
    return generateTypeForDescriptor(type.typeArgs[0], currentAddress) + '[]'
  }

  const simpleName = generateSimpleType(type.qname, currentAddress)
  if (simpleName.length === 0) {
    console.error('unexpected error')
  }
  if (simpleName.includes('vector')) {
    console.error('unexpected error')
  }
  if (type.typeArgs.length > 0) {
    // return simpleName
    return simpleName + '<' + type.typeArgs.map((t) => generateTypeForDescriptor(t, currentAddress)).join(',') + '>'
  }
  return simpleName
}

function generateSimpleType(type: string, currentAddress: string): string {
  const parts = type.split(SPLITTER)

  for (let i = 0; i < parts.length; i++) {
    parts[i] = normalizeToJSName(parts[i])
  }

  if (parts.length < 2) {
    return parts[0]
  }
  if (parts[0] === currentAddress) {
    return parts.slice(1).join('.')
  }
  return '_' + parts.join('.')
}

// TODO ctx need to have type parameters
export function generateType(type: string, currentAddress: string): string {
  return generateTypeForDescriptor(parseMoveType(type), currentAddress)
}

export class AccountModulesImportInfo {
  // account to module
  imports: Map<string, Set<string>>
  account: string
  moduleName: string

  constructor(account: string, tsModuleName: string) {
    this.account = account
    this.moduleName = tsModuleName
    this.imports = new Map<string, Set<string>>()
  }

  addImport(account: string, module: string) {
    if (account === this.account) {
      return
    }
    let accountModules = this.imports.get(account)
    if (!accountModules) {
      accountModules = new Set<string>()
      this.imports.set(account, accountModules)
    }
    accountModules.add(module)
  }
}

export class AccountRegister {
  accountImports = new Map<string, AccountModulesImportInfo>()
  pendingAccounts = new Set<string>()

  // loadedAccount = new Set<string>()
  typeDescriptors = new Map<string, TypeDescriptor>()

  private loadTypeDescriptor(type: string) {
    let descriptor = this.typeDescriptors.get(type)

    // const descriptparseMoveType(type)
    if (!descriptor) {
      descriptor = parseMoveType(type)
      this.typeDescriptors.set(type, descriptor)
    }
    return descriptor
  }

  register(module: MoveModule, tsModuleName: string): AccountModulesImportInfo {
    const currentModuleFqn = moduleQname(module)

    let accountModuleImports = this.accountImports.get(module.address)
    if (!accountModuleImports) {
      accountModuleImports = new AccountModulesImportInfo(module.address, tsModuleName)
      this.accountImports.set(module.address, accountModuleImports)
      // the account has already be processed, delete pending task
      this.pendingAccounts.delete(module.address)
    }

    for (const struct of module.structs) {
      for (const field of struct.fields) {
        for (const type of this.loadTypeDescriptor(field.type).dependedTypes()) {
          const [account, module] = moduleQnameForType(type)
          accountModuleImports.addImport(account, module)
          if (!this.accountImports.has(account)) {
            this.pendingAccounts.add(account)
          }
        }
      }
    }

    for (const func of module.exposed_functions) {
      if (!func.is_entry) {
        continue
      }
      for (const param of func.params) {
        for (const type of this.loadTypeDescriptor(param).dependedTypes()) {
          const [account, module] = moduleQnameForType(type)
          accountModuleImports.addImport(account, module)
          if (!this.accountImports.has(account)) {
            this.pendingAccounts.add(account)
          }
        }
      }
    }
    this.accountImports.set(currentModuleFqn, accountModuleImports)
    return accountModuleImports
  }
}

export function normalizeToJSName(name: string) {
  if (name === 'package' || name === 'volatile') {
    return name + '_'
  }
  return name
}
