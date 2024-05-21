import { StoreContext } from '@sentio/db'
import { ProcessStreamResponse } from '@sentio/protos'

export class MemoryDatabase {
  db = new Map<string, any>()

  constructor(readonly dbContext: StoreContext) {}

  start() {
    this.dbContext.subject.subscribe(this.processRequest.bind(this))
  }

  stop() {
    this.dbContext.subject.unsubscribe()
    this.dbContext.subject.complete()
  }

  private processRequest(request: ProcessStreamResponse) {
    const req = request.dbRequest
    if (req) {
      if (req.upsert) {
        const { data } = req.upsert
        for (const d of data) {
          const id = d['id'] as string
          this.db.set(id, d)
        }
        this.dbContext.result({
          opId: req.opId
        })
      }
      if (req.delete) {
        const { id } = req.delete
        for (const i of id) {
          this.db.delete(i)
        }
        this.dbContext.result({
          opId: req.opId
        })
      }

      if (req.get) {
        const { entity, id } = req.get
        const data = this.db.get(id)
        this.dbContext.result({
          opId: req.opId,
          data
        })
      }
      if (req.list) {
        const { entity, limit, offset } = req.list
        const list = Array.from(this.db.values())
        this.dbContext.result({
          opId: req.opId,
          data: list
        })
      }
    }
  }

  reset() {
    this.db.clear()
  }
}
