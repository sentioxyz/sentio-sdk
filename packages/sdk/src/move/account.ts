import { moduleQname, moduleQnameForType } from './utils.js'
import { InternalMoveModule } from './internal-models.js'

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

  register(module: InternalMoveModule, tsModuleName: string): AccountModulesImportInfo {
    const currentModuleFqn = moduleQname(module)

    let accountModuleImports = this.accountImports.get(module.address)
    if (!accountModuleImports) {
      accountModuleImports = new AccountModulesImportInfo(module.address, tsModuleName)
      this.accountImports.set(module.address, accountModuleImports)
      // the account has already be processed, delete pending task
      this.pendingAccounts.delete(module.address)
    }

    this.registerStruct(module, accountModuleImports)
    this.registerFunctions(module, accountModuleImports)

    this.accountImports.set(currentModuleFqn, accountModuleImports)
    return accountModuleImports
  }

  private registerFunctions(module: InternalMoveModule, accountModuleImports: AccountModulesImportInfo): void {
    for (const func of module.exposedFunctions) {
      if (!func.isEntry) {
        continue
      }
      for (const param of func.params) {
        for (const type of param.dependedTypes()) {
          const [account, module] = moduleQnameForType(type)
          accountModuleImports.addImport(account, module)
          if (!this.accountImports.has(account)) {
            this.pendingAccounts.add(account)
          }
        }
      }
    }
  }

  private registerStruct(module: InternalMoveModule, accountModuleImports: AccountModulesImportInfo): void {
    for (const struct of module.structs) {
      for (const field of struct.fields) {
        for (const type of field.type.dependedTypes()) {
          const [account, module] = moduleQnameForType(type)
          accountModuleImports.addImport(account, module)
          if (!this.accountImports.has(account)) {
            this.pendingAccounts.add(account)
          }
        }
      }
    }
  }
}
