export class ContractNamer {
  defaultName: string
  counter: number

  constructor(defaultName: string) {
    this.defaultName = defaultName
    this.counter = 0
  }

  public nextName(): string {
    const id = this.counter++
    if (id > 0) {
      return this.defaultName + '_' + id
    }
    return this.defaultName
  }
}
