import { ExpressId, InstancedMeshId, MeshInstanceId } from './types'

export class EntityInstance {
  expressId: ExpressId
  type: string
  properties: { [key: string]: any }
  instancedMeshAndMeshInstanceIds: Set<[InstancedMeshId, MeshInstanceId]> = new Set()

  constructor(expressId: ExpressId, type: string, properties: { [key: string]: any }) {
    this.expressId = expressId
    this.type = type
    this.properties = properties
  }
}
