type Constructor = { new (...args: any[]): any }

export function entity<T extends Constructor>(constructor: T, context: any) {
  return constructor
}

export function derivedFrom(field: string) {
  return function (target: any, context: any) {}
}
