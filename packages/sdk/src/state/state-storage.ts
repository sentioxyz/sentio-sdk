export abstract class StateStorage<T> {
  // TODO learn how to define single instance for all subclasses

  protected constructor() {
    //
  }

  abstract initValue(): T

  key(): string {
    return this.constructor.name
  }

  getOrRegister(): T {
    let metricState: T = global.PROCESSOR_STATE.stateMap.get(this.key())
    if (!metricState) {
      metricState = this.initValue()
      global.PROCESSOR_STATE.stateMap.set(this.key(), metricState)
    }
    return metricState
  }
}

export abstract class MapStateStorage<T> extends StateStorage<Map<string, T>> {
  initValue() {
    return new Map<string, T>()
  }

  getValue(key: string): T | undefined {
    const m = this.getOrRegister()
    return m.get(key)
  }

  getValues(): T[] {
    const m = this.getOrRegister()
    return Array.from(m.values())
  }

  getOrSetValue(key: string, value: T): T {
    const m = this.getOrRegister()
    const oldValue = m.get(key)
    if (oldValue) {
      console.warn(key, 'has been registered twice, use the previous one')
      return oldValue
    }
    m.set(key, value)
    return value
  }
}

export abstract class ListStateStorage<T> extends StateStorage<T[]> {
  initValue() {
    return []
  }

  getValues(): T[] {
    return this.getOrRegister()
  }

  addValue(value: T): T {
    const m = this.getOrRegister()
    m.push(value)
    return value
  }
}
