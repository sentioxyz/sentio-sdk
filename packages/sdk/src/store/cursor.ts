export interface CursorOptions {
  initCursor?: string
  pageSize?: number
}

export class Cursor {
  _cursor?: string
  private _done = false
  readonly pageSize?: number
  constructor(options?: CursorOptions) {
    this._cursor = options?.initCursor
    this.pageSize = options?.pageSize
  }

  get cursor(): string | undefined {
    return this._cursor
  }

  set cursor(cursor: string | undefined) {
    if (!cursor) {
      this._done = true
    }
    this._cursor = cursor
  }

  get hasNext(): boolean {
    return !this._done
  }
}
