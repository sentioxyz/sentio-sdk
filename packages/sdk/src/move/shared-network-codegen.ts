import {
  AbstractCodegen,
  ChainAdapter,
  InternalMoveFunction,
  InternalMoveModule,
  InternalMoveStruct,
  moduleQname,
  SPLITTER,
  camel,
  normalizeToJSName,
  upperFirst
} from '@typemove/move'

export abstract class SharedNetworkCodegen<NetworkType, ModuleTypes, StructType> extends AbstractCodegen<
  ModuleTypes,
  StructType
> {
  network: NetworkType
  constructor(network: NetworkType, chainAdapter: ChainAdapter<ModuleTypes, StructType>) {
    super(chainAdapter)
    this.network = network
  }
  generateModule(module: InternalMoveModule, allEventStructs: Map<string, InternalMoveStruct>) {
    const functions = module.exposedFunctions
      .map((f) => this.generateForEntryFunctions(module, f))
      .filter((s) => s !== '')

    const qname = moduleQname(module)
    const eventStructs = new Map<string, InternalMoveStruct>()
    for (const [type, struct] of allEventStructs.entries()) {
      if (type.startsWith(qname + SPLITTER)) {
        eventStructs.set(type, struct)
      }
    }

    const events = Array.from(eventStructs.values())
      .map((e) => this.generateForOnEvents(module, e))
      .filter((s) => s !== '')

    const moduleName = normalizeToJSName(module.name)

    let processor = ''
    if (functions.length > 0 || events.length > 0) {
      processor = `export class ${moduleName} extends ${this.PREFIX}BaseProcessor {

    constructor(options: ${this.PREFIX}BindOptions) {
      super("${module.name}", options)
    }
    static DEFAULT_OPTIONS: ${this.PREFIX}BindOptions = {
      address: "${module.address}",
      network: ${this.PREFIX}Network.${this.generateNetworkOption(this.network)}
    }

    static bind(options: Partial<${this.PREFIX}BindOptions> = {}): ${moduleName} {
      return new ${moduleName}({ ...${moduleName}.DEFAULT_OPTIONS, ...options })
    }

    ${functions.join('\n')}
    
    ${events.join('\n')}
 }
  `
    }

    return processor + super.generateModule(module, allEventStructs)
  }

  // protected generateExtra(module: InternalMoveModule): string {
  //   const callArgs = module.exposedFunctions.map((f: InternalMoveFunction) => this.generateCallArgsStructs(module, f))
  //
  //   return `
  //     ${callArgs.join('\n')}
  //   `
  // }

  abstract generateNetworkOption(network: NetworkType): string

  generateForEntryFunctions(module: InternalMoveModule, func: InternalMoveFunction) {
    if (!func.isEntry) {
      return ''
    }

    // const genericString = generateFunctionTypeParameters(func)
    const moduleName = normalizeToJSName(module.name)

    const camelFuncName = upperFirst(camel(func.name))
    const source = `
  onEntry${camelFuncName}(func: (call: ${moduleName}.${camelFuncName}Payload, ctx: ${this.PREFIX}Context) => void, filter?: CallFilter, fetchConfig?: Partial<MoveFetchConfig>): ${moduleName} {
    this.onEntryFunctionCall(func, {
      ...filter,
      function: '${module.name}::${func.name}'
    },
    fetchConfig)
    return this
  }`

    return source
  }

  generateForOnEvents(module: InternalMoveModule, struct: InternalMoveStruct): string {
    const moduleName = normalizeToJSName(module.name)
    const source = `
onEvent${struct.name}(func: (event: ${moduleName}.${normalizeToJSName(struct.name)}Instance, ctx: ${
      this.PREFIX
    }Context) => void, fetchConfig?: Partial<MoveFetchConfig>): ${moduleName} {
  this.onMoveEvent(func, { type: '${module.name}::${struct.name}' }, fetchConfig)
  return this
}`
    return source
  }

  generateImports() {
    return (
      super.generateImports() +
      `
    import { CallFilter, MoveFetchConfig } from "@sentio/sdk/move"
    import {
      ${this.PREFIX}BindOptions, ${this.PREFIX}BaseProcessor,
      ${this.PREFIX}Network, TypedFunctionPayload,
      ${this.PREFIX}Context } from "@sentio/sdk/${this.PREFIX.toLowerCase()}"
`
    )
  }

  protected defaultCoderPackage(): string {
    return `@sentio/sdk/${this.PREFIX.toLowerCase()}`
  }

  generateLoadAll(isSystem: boolean): string {
    let source = `loadAllTypes(defaultMoveCoder(${this.PREFIX}Network.${this.generateNetworkOption(this.network)}))`
    if (isSystem) {
      source = `
      loadAllTypes(defaultMoveCoder(${this.PREFIX}Network.MAIN_NET))
      loadAllTypes(defaultMoveCoder(${this.PREFIX}Network.TEST_NET))
      `
    }
    return source
  }

  generateCallArgsStructs(module: InternalMoveModule, func: InternalMoveFunction) {
    if (!func.isEntry) {
      return ''
    }

    const fields = this.chainAdapter.getMeaningfulFunctionParams(func.params).map((param) => {
      return this.generateTypeForDescriptor(param, module.address) + (this.PAYLOAD_OPTIONAL ? ' | undefined' : '')
    })

    const camelFuncName = upperFirst(camel(func.name))

    const genericString = this.generateFunctionTypeParameters(func)
    return `
  export interface ${camelFuncName}Payload${genericString}
      extends TypedFunctionPayload<[${fields.join(',')}]> {
    arguments_decoded: [${fields.join(',')}],
    type_arguments: [${func.typeParams.map((_) => 'string').join(', ')}]
  }
  `
  }
}
