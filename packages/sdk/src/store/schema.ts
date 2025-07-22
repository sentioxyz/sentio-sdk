import { buildASTSchema, DocumentNode, extendSchema, GraphQLSchema, parse, validateSchema } from 'graphql/index.js'
import * as fs from 'node:fs'
import { GraphQLObjectType, GraphQLOutputType, isListType, isNonNullType } from 'graphql'

const customScalars = ['BigInt', 'BigDecimal', 'Timestamp', 'JSON', 'Bytes', 'ID', 'Int8']

const baseSchema = buildASTSchema(
  parse(`
    directive @entity(immutable: Boolean! = false, sparse: Boolean! = false, timeseries: Boolean! = false) on OBJECT
    directive @query on INTERFACE
    directive @derivedFrom(field: String!) on FIELD_DEFINITION
    directive @unique on FIELD_DEFINITION
    directive @index(fields: [String!] unique: Boolean) repeatable on OBJECT | FIELD_DEFINITION
    directive @dbType(type: String!) on FIELD_DEFINITION
    directive @fulltext(query: String!) on FIELD_DEFINITION
    directive @cardinality(value: Int!) on OBJECT | FIELD_DEFINITION
    directive @byteWeight(value: Float!) on FIELD_DEFINITION
    directive @variant on OBJECT # legacy
    directive @jsonField on OBJECT # legacy
    directive @aggregation(intervals: [String!]! = ["hour"], source: String!) on OBJECT
    directive @aggregate(fn: String!, arg: String, cumulative: Boolean = false) on FIELD_DEFINITION
    ${customScalars.map((name) => 'scalar ' + name).join('\n')}
`)
)

function getElemType(type: GraphQLOutputType) {
  if (isNonNullType(type)) {
    return getElemType(type.ofType)
  }
  if (isListType(type)) {
    return getElemType(type.ofType)
  }
  return type
}

function checkRelations(schema: GraphQLSchema) {
  for (const t of Object.values(schema.getTypeMap())) {
    if (t.name.startsWith('__')) {
      continue
    }
    if (t instanceof GraphQLObjectType) {
      for (const f of Object.values(t.getFields())) {
        if (f.astNode) {
          for (const d of f.astNode.directives ?? []) {
            if (d.name.value === 'derivedFrom') {
              const arg = (d.arguments ?? []).find((a) => a.name.value === 'field')
              if (!arg || !arg.value || arg.value.kind !== 'StringValue') {
                throw new Error(`@derivedFrom directive must have a 'field' argument`)
              }
              const fieldName = arg.value.value
              const targetType = getElemType(f.type) as GraphQLObjectType
              // Check if the target type has a field with the same name
              if (!targetType.getFields()[fieldName]) {
                throw new Error(`Field '${fieldName}' not found in type '${targetType.name}'`)
              }
            }
          }
        }
      }
    }
  }
}

export function buildSchema(doc: DocumentNode): GraphQLSchema {
  const schema = extendSchema(baseSchema, doc)
  const errors = validateSchema(schema).filter((err) => !/query root/i.test(err.message))
  if (errors.length > 0) {
    throw errors[0]
  }
  checkRelations(schema)
  return schema
}

export function schemaFromFile(filePath: string) {
  const source = fs.readFileSync(filePath, 'utf-8')
  const doc = parse(source)
  return { schema: buildSchema(doc), source }
}
