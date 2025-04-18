import { ExpressId, MeshInstanceId } from './types'

export class EntityType {
  name: string
  propertyKeys: Set<string>
  expressIds: Set<ExpressId>
  meshInstanceIds: Set<MeshInstanceId>
  childrenEntityTypes: Set<string>

  constructor(
    name: string,
    propertyKeys: Set<string> = new Set(),
    expressIds: Set<ExpressId> = new Set(),
    meshInstanceIds: Set<MeshInstanceId> = new Set(),
    childrenEntityTypes: Set<string> = new Set(),
  ) {
    this.name = name
    this.propertyKeys = propertyKeys
    this.expressIds = expressIds
    this.meshInstanceIds = meshInstanceIds
    this.childrenEntityTypes = childrenEntityTypes
  }
}
