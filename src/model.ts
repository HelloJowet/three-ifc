import { EntityInstance } from './entityInstance'
import { EntityType } from './entityType'
import { Group } from './graphics'
import { Metadata } from './metadata'
import { ExpressId, ModelId } from './types'

export class Model {
  id: ModelId
  group: Group
  rootExpressId: ExpressId
  entityInstances: Map<ExpressId, EntityInstance>
  metadata: Metadata

  constructor(id: ModelId, group: Group, rootExpressId: ExpressId, entityInstances: Map<ExpressId, EntityInstance>, metadata: Metadata) {
    this.id = id
    this.group = group
    this.rootExpressId = rootExpressId
    this.entityInstances = entityInstances
    this.metadata = metadata
  }

  setVisibleInstances(visibleExpressIds: Set<ExpressId>) {
    this.group.setVisibleInstances(visibleExpressIds, this)
  }

  getEntityTypes(): EntityType[] {
    const entityTypes: Map<string, EntityType> = new Map()

    for (const entityInstance of this.entityInstances.values()) {
      const entityType = entityTypes.get(entityInstance.type) ?? new EntityType(entityInstance.type)
      entityType.expressIds.add(entityInstance.expressId)
      for (const propertyKey of entityInstance.properties.keys()) entityType.propertyKeys.add(propertyKey)
      for (const [_, meshInstanceId] of entityInstance.instancedMeshAndMeshInstanceIds) entityType.meshInstanceIds.add(meshInstanceId)
      entityTypes.set(entityInstance.type, entityType)
    }

    return Array.from(entityTypes.values())
  }

  getEntityRelationships(): Map<string, Set<string>> {
    const entityRelationships: Map<string, Set<string>> = new Map()

    for (const entityInstance of this.entityInstances.values()) {
      const entityRelationship = entityRelationships.get(entityInstance.type) ?? new Set()
      for (const entityInstanceChildExpressId of entityInstance.childrenExpressIds) {
        const entityInstanceChild = this.entityInstances.get(entityInstanceChildExpressId)
        if (!entityInstanceChild) throw new Error(`Entity instance with the express id ${entityInstanceChild} does not exist`)
        entityRelationship.add(entityInstanceChild.type)
      }
      entityRelationships.set(entityInstance.type, entityRelationship)
    }

    return entityRelationships
  }
}
