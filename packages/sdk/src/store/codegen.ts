import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  isEnumType,
  isListType,
  isNonNullType
} from 'graphql'
import * as fs from 'node:fs'
import path from 'path'
import { mkdirpSync } from 'mkdirp'
import { schemaFromFile } from './schema.js'
import chalk from 'chalk'
import { upperFirst } from '../fuel/codegen/utils.js'
import { GraphQLField } from 'graphql/index.js'

interface Import {
  module: string
  types: string[]
  importType?: boolean
}

interface Field {
  name: string
  type: string
  optional?: boolean
  annotations: string[]
  private?: boolean
}

interface Method {
  name: string
  returnType?: string
  body: string
  annotations: string[]
  parameters?: string[]
}

interface Class {
  name: string
  fields: Field[]
  methods?: Method[]
  annotations: string[]
  parent?: string
  interfaces: string[]
  timeseries?: boolean
}

interface Interface {
  name: string
  fields: Field[]
}

interface Enum {
  name: string
  values: string[]
}

export async function codegen(srcDir: string, outputDir: string) {
  for (const file of fs.readdirSync(srcDir)) {
    const f = path.join(srcDir, file)
    const filePath = path.parse(f)
    if (filePath.ext == '.graphql') {
      const { schema, source } = schemaFromFile(f)
      const target = path.join(outputDir, filePath.name + '.ts')
      await codegenInternal(schema, source, target)
      console.log(chalk.green(`Generated ${target}`))
    }
  }
}

function addTypeAnnotations(ty: GraphQLOutputType, annotations: string[]) {
  if (isNonNullType(ty)) {
    annotations.push('@Required')
    addTypeAnnotations(ty.ofType, annotations)
    return
  }

  if (isRelationType(ty)) {
    if (isListType(ty)) {
      annotations.push(`@Many("${ty.ofType}")`)
    } else {
      annotations.push(`@One("${ty}")`)
    }
  } else if (isEnumType(ty)) {
    annotations.push(`@Column("String${isNonNullType(ty) ? '!' : ''}")`)
  } else {
    if (isListType(ty)) {
      if (isListType(ty.ofType)) {
        annotations.push(`@ListColumn()`)
        addTypeAnnotations(ty.ofType, annotations)
      } else {
        annotations.push(`@ListColumn("${ty.ofType}")`)
      }
    } else {
      annotations.push(`@Column("${ty}")`)
    }
  }
}

async function codegenInternal(schema: GraphQLSchema, source: string, target: string) {
  const imports: Import[] = [
    {
      module: '@sentio/sdk/store',
      types: ['String', 'Int', 'BigInt', 'Float', 'ID', 'Bytes', 'Timestamp', 'Boolean', 'Int8'],
      importType: true
    },
    {
      module: '@sentio/sdk/store',
      types: ['Entity', 'Required', 'One', 'Many', 'Column', 'ListColumn', 'AbstractEntity', 'getStore', 'UpdateValues']
    },
    {
      module: '@sentio/bigdecimal',
      types: ['BigDecimal']
    },
    {
      module: '@sentio/sdk',
      types: ['DatabaseSchema']
    }
  ]
  const enums: Enum[] = []
  const interfaces: Interface[] = []
  const classes: Class[] = []

  for (const t of Object.values(schema.getTypeMap())) {
    if (t.name.startsWith('__')) {
      continue
    }
    if (t instanceof GraphQLEnumType) {
      enums.push({
        name: t.name,
        values: t.getValues().map((v) => v.value)
      })
    }
    if (t instanceof GraphQLInterfaceType) {
      interfaces.push({
        name: t.name,
        fields: Object.values(t.getFields()).map((f) => ({
          name: f.name,
          type: genType(f.type),
          annotations: []
        }))
      })
    }
  }

  for (const t of Object.values(schema.getTypeMap())) {
    if (t.name.startsWith('__')) {
      continue
    }

    if (t instanceof GraphQLObjectType) {
      if (isTimeseries(t)) {
        // check id is int8
        const idField = t.getFields()['id']
        if (!idField || !isNonNullType(idField.type) || idField.type.toString() !== 'Int8!') {
          throw new Error(`Timeseries entity ${t.name} must have an id field of type Int8!`)
        }
        // check if it has a timestamp field
        const timestampField = t.getFields()['timestamp']
        if (!timestampField || !isNonNullType(timestampField.type) || timestampField.type.toString() !== 'Timestamp!') {
          throw new Error(`Timeseries entity ${t.name} must have a timestamp field of type Timestamp!`)
        }
      }
      if (isEntity(t)) {
        const fields: Field[] = []
        const methods: Method[] = []
        for (const f of Object.values(t.getFields())) {
          const type = genType(f.type)
          const annotations: string[] = []
          addTypeAnnotations(f.type, annotations)
          if (isRelationType(f.type)) {
            const isMany = type.startsWith('Array')

            if (isDerived(f)) {
              const derivedField = getDerivedField(f)
              if (isMany) {
                methods.push({
                  name: f.name,
                  returnType: `Promise<${type}>`,
                  body: `return this.store.list(${elemType(f.type)}, [{field: '${derivedField}', op: '=', value: this.id}])`,
                  annotations: []
                })
              } else {
                methods.push({
                  name: f.name,
                  returnType: `Promise<${type}>`,
                  body: `return this.store.list(${elemType(f.type)}, [{field: '${derivedField}', op: '=', value: this.id}]).then((r) => r?.[0])`,
                  annotations: []
                })
              }
            } else {
              fields.push({
                name: '_' + f.name,
                type: `Promise<${type}>`,
                annotations,
                private: true
              })
              methods.push({
                name: f.name,
                returnType: `Promise<${type}>`,
                body: `return this._${f.name}`,
                annotations: []
              })
              fields.push({
                name: f.name + 'ID' + (isMany ? 's' : ''),
                type: isMany ? `Array<ID | undefined>` : `ID`,
                annotations: []
              })
              if (isMany) {
                methods.push({
                  name: `set${upperFirst(f.name)}`,
                  parameters: [`${f.name}: ${type}`],
                  returnType: ``,
                  body: `if (${f.name}) this.${f.name}IDs = ${f.name}.map((e) => e.id)`,
                  annotations: []
                })
              } else {
                methods.push({
                  name: `set${upperFirst(f.name)}`,
                  parameters: [`${f.name}: ${type}`],
                  returnType: ``,
                  body: `if (${f.name}) this.${f.name}ID = ${f.name}.id`,
                  annotations: []
                })
              }
            }
          } else {
            fields.push({
              name: f.name,
              optional: !f.type.toString().endsWith('!'),
              type: type.replace(' | undefined', ''),
              annotations
            })
          }
        }
        classes.push({
          name: t.name,
          timeseries: isTimeseries(t),
          fields,
          methods,
          annotations: [`@Entity("${t.name}")`],
          parent: 'AbstractEntity',
          interfaces: t.getInterfaces().map((i) => i.name)
        })
      } else {
        classes.push({
          name: t.name,
          fields: Object.values(t.getFields()).map((f) => ({
            name: f.name,
            optional: !f.type.toString().endsWith('!'),
            type: genType(f.type).replace(' | undefined', ''),
            annotations: []
          })),
          annotations: [],
          interfaces: t.getInterfaces().map((i) => i.name)
        })
      }
    }
  }

  const template = `
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
${imports.map((i) => `import ${i.importType ? 'type ' : ''}{ ${i.types.join(', ')} } from '${i.module}'`).join('\n')}

${enums
  .map(
    (e) => `export enum ${e.name} {
  ${e.values.map((v) => `${v} = "${v}"`).join(', ')}
}`
  )
  .join('\n')}

${interfaces
  .map(
    (i) => `export interface ${i.name} {
  ${i.fields.map((f) => `\t${f.name}: ${f.type}`).join('\n')}
}`
  )
  .join('\n')}

${classes
  .map((c) => {
    // Only generate constructor interface for Entity classes
    const isEntity = c.annotations.some((a) => a.startsWith('@Entity'))
    const constructorInterface = isEntity
      ? `
interface ${c.name}ConstructorInput {
${c.fields
  .filter((f) => !f.type.startsWith('Promise<')) // Filter out Promise fields
  .map((f) => {
    if (c.timeseries && f.name == 'timestamp') {
      return `  timestamp?: Timestamp;`
    }
    const isRequired = f.annotations.some((a) => a.includes('@Required'))
    return `  ${f.private ? 'private ' : ''}${f.name}${isRequired ? '' : '?'}: ${f.type.replace(' | undefined', '')};`
  })
  .join('\n')}
}`
      : ''
    return `
${constructorInterface}
${c.annotations.join('\n')}
export class ${c.name} ${c.parent ? `extends ${c.parent}` : ''} ${c.interfaces.length > 0 ? `implements ${c.interfaces.join(', ')}` : ''} {
${c.fields
  .map((f) => `${f.annotations.map((a) => `\n\t${a}`).join('')}\n\t${f.name}${f.optional ? '?' : ''}: ${f.type}`)
  .join('\n')}
  ${isEntity ? `constructor(data: ${c.name}ConstructorInput) {super()}` : ''}
  ${(c.methods ?? []).map(genMethod).join('\n')}
  
  ${
    isEntity
      ? `static update(values: UpdateValues<${c.name}ConstructorInput>): Promise<void> {
    return getStore().update(${c.name}, values)
  }`
      : ``
  }
}`
  })
  .join('\n')}
`

  const contents =
    template +
    `\n
const source = \`${source.replaceAll('`', '`')}\`
DatabaseSchema.register({
  source,
  entities: {
    ${classes.map((e) => `"${e.name}": ${e.name}`).join(',\n\t\t')}
  }
})
`
  mkdirpSync(path.dirname(target))

  fs.writeFileSync(target, contents)
}

function genType(type: GraphQLOutputType, required?: boolean): string {
  if (type instanceof GraphQLNonNull) {
    return genType(type.ofType, true)
  } else if (type instanceof GraphQLScalarType) {
    return required ? type.name : `${type.name} | undefined`
  } else if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
    return required ? type.name : `${type.name} | undefined`
  } else if (type instanceof GraphQLList) {
    return `Array<${genType(type.ofType)}>`
  } else if (type instanceof GraphQLEnumType) {
    return required ? type.name : `${type.name} | undefined`
  } else {
    throw new Error('Unsupported type: ' + type)
  }
}

function elemType(type: GraphQLOutputType): GraphQLOutputType {
  if (isNonNullType(type)) {
    return elemType(type.ofType)
  }
  if (isListType(type)) {
    return elemType(type.ofType)
  }
  return type
}

function genMethod(method: Method) {
  return `${method.annotations.map((a) => `@${a}`).join('\n')}
  ${method.name}(${method.parameters?.join(', ') ?? ''})${method.returnType ? `: ${method.returnType}` : ''} {
    ${method.body}
  }`
}

function isRelationType(type: GraphQLOutputType): boolean {
  if (type instanceof GraphQLNonNull) {
    return isRelationType(type.ofType)
  } else if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
    return true
  } else if (type instanceof GraphQLList) {
    return isRelationType(type.ofType)
  } else {
    return false
  }
}

function isEntity(t: GraphQLObjectType) {
  return t.astNode?.directives?.some((d) => d.name.value == 'entity')
}

function isTimeseries(t: GraphQLObjectType) {
  return t.astNode?.directives?.some(
    (d) =>
      d.name.value == 'entity' &&
      d.arguments?.some((a) => a.name.value == 'timeseries' && a.value.kind == 'BooleanValue' && a.value.value == true)
  )
}

function isDerived(f: GraphQLField<any, any>) {
  return f.astNode?.directives?.some((d) => d.name.value == 'derivedFrom')
}

function getDerivedField(f: GraphQLField<any, any>) {
  return (
    f.astNode?.directives
      ?.find((d) => d.name.value == 'derivedFrom')
      // @ts-ignore access astNode
      ?.arguments?.find((a) => a.name.value == 'field')?.value?.value
  )
}
