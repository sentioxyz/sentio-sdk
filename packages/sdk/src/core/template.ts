import { ListStateStorage } from '@sentio/runtime'
import { TemplateInstance } from '@sentio/protos'

export class TemplateInstanceState extends ListStateStorage<TemplateInstance> {
  static INSTANCE = new TemplateInstanceState()
}
