import { normalizeKey } from './normalization.js'

export class NamedResultDescriptor {
  name: string

  constructor(name: string) {
    this.name = normalizeKey(name)
  }
}
