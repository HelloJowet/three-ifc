import { ExpressId, InstancedMeshId, MeshInstanceId } from './types'

export class EntityInstance {
  expressId: ExpressId
  type: string
  properties: Map<string, any>
  childrenExpressIds: Set<ExpressId>
  instancedMeshAndMeshInstanceIds: Set<[InstancedMeshId, MeshInstanceId]> = new Set()

  constructor(expressId: ExpressId, type: string, properties: Map<string, any>, childrenExpressIds: Set<ExpressId>) {
    this.expressId = expressId
    this.type = type
    this.properties = properties
    this.childrenExpressIds = childrenExpressIds
  }
}
