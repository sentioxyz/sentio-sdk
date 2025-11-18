export class State {
  stateMap = new Map<string, any>()

  static INSTANCE = new State()

  static reset() {
    State.INSTANCE = new State()
  }
}

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
    let metricState: T = State.INSTANCE.stateMap.get(this.key())
    if (!metricState) {
      metricState = this.initValue()
      State.INSTANCE.stateMap.set(this.key(), metricState)
    }
    return metricState
  }

  unregister(): T {
    const value = State.INSTANCE.stateMap.get(this.key())
    State.INSTANCE.stateMap.delete(this.key())
    return value
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
      if (oldValue !== value) {
        console.warn(key, 'has been registered twice, use the previous one')
      }
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
