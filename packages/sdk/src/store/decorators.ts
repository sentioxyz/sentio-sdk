type Constructor = { new (...args: any[]): any }

export function entity<T extends Constructor>(constructor: T, context: any) {
  return constructor
}

export function derivedFrom(field: string) {
  return function (target: any, context: any) {}
}

export function unique(field: string) {
  return function (target: any, context: any) {}
}

export function index(field: string[]) {
  return function (target: any, context: any) {}
}

export function fulltext(query: string) {
  return function (target: any, context: any) {}
}

export function cardinality(value: number) {
  return function (target: any, context: any) {}
}

export function byteWeight(value: number) {
  return function (target: any, context: any) {}
}
