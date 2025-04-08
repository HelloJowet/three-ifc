import { EntityInstance } from './entityInstance'
import { Group } from './graphics/group'
import { Metadata } from './metadata'
import { SpatialStructure } from './spatialStructure'
import { ExpressId, InstancedMeshId, MeshInstanceId } from './types'

export class Model {
  group: Group
  entityInstances: Map<ExpressId, EntityInstance>
  spatialStructure: SpatialStructure
  metadata: Metadata

  constructor(group: Group, entityInstances: Map<ExpressId, EntityInstance>, spatialStructure: SpatialStructure, metadata: Metadata) {
    this.group = group
    this.entityInstances = entityInstances
    this.spatialStructure = spatialStructure
    this.metadata = metadata
  }

  setVisibleInstances(visibleExpressIds: Set<ExpressId>) {
    this.group.setVisibleInstances(visibleExpressIds, this)
  }
}
