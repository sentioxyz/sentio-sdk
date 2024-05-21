import { buildASTSchema, DocumentNode, extendSchema, GraphQLSchema, parse, validateSchema } from 'graphql/index.js'
import * as fs from 'node:fs'

const customScalars = ['BigInt', 'BigDecimal', 'DateTime', 'JSON', 'Bytes', 'ID']

const baseSchema = buildASTSchema(
  parse(`
    directive @entity on OBJECT
    directive @query on INTERFACE
    directive @derivedFrom(field: String!) on FIELD_DEFINITION
    directive @unique on FIELD_DEFINITION
    directive @index(fields: [String!] unique: Boolean) repeatable on OBJECT | FIELD_DEFINITION
    directive @fulltext(query: String!) on FIELD_DEFINITION
    directive @cardinality(value: Int!) on OBJECT | FIELD_DEFINITION
    directive @byteWeight(value: Float!) on FIELD_DEFINITION
    directive @variant on OBJECT # legacy
    directive @jsonField on OBJECT # legacy
    ${customScalars.map((name) => 'scalar ' + name).join('\n')}
`)
)

export function buildSchema(doc: DocumentNode): GraphQLSchema {
  const schema = extendSchema(baseSchema, doc)
  const errors = validateSchema(schema).filter((err) => !/query root/i.test(err.message))
  if (errors.length > 0) {
    throw errors[0]
  }
  return schema
}

export function schemaFromFile(filePath: string) {
  const source = fs.readFileSync(filePath, 'utf-8')
  const doc = parse(source)
  return { schema: buildSchema(doc), source }
}
