export class StarknetEvent<T> {
  constructor(
    readonly caller: string,
    readonly transactionHash: string,
    readonly data: T
  ) {}
}
