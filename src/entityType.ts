import { ExpressId, MeshInstanceId } from './types'

export class EntityType {
  name: string
  propertyKeys: Set<string>
  expressIds: Set<ExpressId>
  meshInstanceIds: Set<MeshInstanceId>

  constructor(name: string, propertyKeys: Set<string> = new Set(), expressIds: Set<ExpressId> = new Set(), meshInstanceIds: Set<MeshInstanceId> = new Set()) {
    this.name = name
    this.propertyKeys = propertyKeys
    this.expressIds = expressIds
    this.meshInstanceIds = meshInstanceIds
  }
}
