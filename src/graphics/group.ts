import * as THREE from 'three'

import { Model } from '../model'
import { ExpressId, InstancedMeshId, MeshInstanceId, ModelId } from '../types'
import { InstancedMesh } from './instancedMesh'

/**
 * Group represents a collection of InstancedMeshes.
 */
export class Group {
  instancedMeshes: Map<InstancedMeshId, InstancedMesh>
  threeJsInstance: THREE.Group
  // private threeJsInstancedMeshIdToInstancedMeshId: Map<ThreeJsInstancedMeshId, InstancedMeshId> = new Map()

  constructor(modelId: ModelId, instancedMeshes: Map<InstancedMeshId, InstancedMesh>) {
    this.instancedMeshes = instancedMeshes

    this.threeJsInstance = new THREE.Group()
    this.threeJsInstance.userData = { isPartOfThreeJs: true, modelId: modelId }
    for (const instancedMesh of instancedMeshes.values()) this.threeJsInstance.add(instancedMesh.threeJsInstance)
  }

  /**
   * Sets visibility of mesh instances based on Express IDs
   */
  setVisibleInstances(visibleExpressIds: Set<ExpressId>, model: Model) {
    const instancedMeshesVisibleInstancesIds: Map<InstancedMeshId, Set<MeshInstanceId>> = new Map()

    for (const entityInstance of model.entityInstances.values()) {
      for (const [instancedMeshId, meshInstanceId] of entityInstance.instancedMeshAndMeshInstanceIds) {
        const meshInstanceIds = instancedMeshesVisibleInstancesIds.get(instancedMeshId) ?? new Set()
        if (visibleExpressIds.has(entityInstance.expressId)) meshInstanceIds.add(meshInstanceId)
        instancedMeshesVisibleInstancesIds.set(instancedMeshId, meshInstanceIds)
      }
    }

    for (const [instancedMeshId, meshInstanceIds] of instancedMeshesVisibleInstancesIds) {
      const instancedMesh = this.instancedMeshes.get(instancedMeshId)
      if (!instancedMesh) throw new Error('Unexpected error')

      instancedMesh.setVisibleInstances(meshInstanceIds)
    }
  }
}
