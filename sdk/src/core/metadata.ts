import { DataDescriptor } from '../gen'
import { normalizeName } from './meter'

export type Labels = { [key: string]: string }

export class DescriptorWithUsage {
  descriptor: DataDescriptor
  usage = 0
  constructor(descriptor: DataDescriptor) {
    this.descriptor = descriptor
    this.descriptor.name = normalizeName(descriptor.name)
  }

  getShortDescriptor(): DataDescriptor {
    if (this.usage > 0) {
      // Other setting don't need to be write multiple times
      return DataDescriptor.fromPartial({ name: this.descriptor.name })
    }

    return this.descriptor
  }
}
