import { StoreContext } from '../context.js'
import { ProcessStreamResponse, RichStruct } from '@sentio/protos'

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
        const { entityData } = req.upsert
        for (const d of entityData) {
          const id = d.fields['id'].stringValue!
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
          entities: { entities: data ? [data] : [] }
        })
      }
      if (req.list) {
        const { entity, cursor } = req.list
        const list = Array.from(this.db.values())
        if (cursor) {
          const idx = parseInt(cursor)

          this.dbContext.result({
            opId: req.opId,
            entities: { entities: list.slice(idx, idx + 1) as RichStruct[] },
            nextCursor: idx + 1 < list.length ? `${idx + 1}` : undefined
          })
        } else {
          this.dbContext.result({
            opId: req.opId,
            entities: { entities: [list[0]] },
            nextCursor: '1'
          })
        }
      }
    }
  }

  reset() {
    this.db.clear()
  }
}
