export interface ExecutionConfig {
  // Whether to execute transactions sequentially, by default it's false
  sequential: boolean
}
export interface GlobalConfig {
  execution: ExecutionConfig
}

// Experimental global config, only apply to eth for now
export const GLOBAL_CONFIG: GlobalConfig = {
  execution: {
    sequential: false
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
