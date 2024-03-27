import { ExecutionConfig } from './gen/processor/protos/processor.js'

export interface GlobalConfig {
  execution: Partial<ExecutionConfig>
}

// Experimental global config, only apply to eth for now
export const GLOBAL_CONFIG: GlobalConfig = {
  execution: {
    sequential: false,
    forceExactBlockTime: false
  }
}

export function freezeGlobalConfig() {
  deepFreeze(GLOBAL_CONFIG.execution)
}

export function deepFreeze(object: any) {
  // Retrieve the property names defined on object
  const propNames = Reflect.ownKeys(object)

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name]

    if ((value && typeof value === 'object') || typeof value === 'function') {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}
