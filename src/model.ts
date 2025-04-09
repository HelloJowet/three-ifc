import { EntityInstance } from './entityInstance'
import { Group } from './graphics'
import { Metadata } from './metadata'
import { SpatialStructure } from './spatialStructure'
import { ExpressId, ModelId } from './types'

export class Model {
  id: ModelId
  group: Group
  entityInstances: Map<ExpressId, EntityInstance>
  spatialStructure: SpatialStructure
  metadata: Metadata

  constructor(id: ModelId, group: Group, entityInstances: Map<ExpressId, EntityInstance>, spatialStructure: SpatialStructure, metadata: Metadata) {
    this.id = id
    this.group = group
    this.entityInstances = entityInstances
    this.spatialStructure = spatialStructure
    this.metadata = metadata
  }

  setVisibleInstances(visibleExpressIds: Set<ExpressId>) {
    this.group.setVisibleInstances(visibleExpressIds, this)
  }
}
