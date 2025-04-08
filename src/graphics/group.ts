import * as THREE from 'three'

import { Model } from '../model'
import { ExpressId, InstancedMeshId, MeshInstanceId } from '../types'
import { InstancedMesh } from './instancedMesh'

/**
 * Group represents a collection of InstancedMeshes.
 */
export class Group {
  instancedMeshes: Map<InstancedMeshId, InstancedMesh>
  threeJsInstance: THREE.Group
  // private threeJsInstancedMeshIdToInstancedMeshId: Map<ThreeJsInstancedMeshId, InstancedMeshId> = new Map()

  constructor(instancedMeshes: Map<InstancedMeshId, InstancedMesh>) {
    this.instancedMeshes = instancedMeshes

    this.threeJsInstance = new THREE.Group()
    for (const instancedMesh of instancedMeshes.values()) this.threeJsInstance.add(instancedMesh.threeJsInstance)
  }

  /**
   * Sets visibility of mesh instances based on Express IDs
   */
  setVisibleInstances(visibleExpressIds: Set<ExpressId>, model: Model) {
    const instancedMeshesVisibleInstancesIds: Map<InstancedMeshId, Set<MeshInstanceId>> = new Map()

    for (const expressId of model.entityInstances.keys()) {
      const entityInstance = model.entityInstances.get(expressId)
      if (!entityInstance) continue

      for (const [instancedMeshId, meshInstanceId] of entityInstance.instancedMeshAndMeshInstanceIds) {
        const meshInstanceIds = instancedMeshesVisibleInstancesIds.get(instancedMeshId) ?? new Set()
        if (visibleExpressIds.has(expressId)) meshInstanceIds.add(meshInstanceId)
        instancedMeshesVisibleInstancesIds.set(instancedMeshId, meshInstanceIds)
      }
    }

    for (const [instancedMeshId, meshInstanceIds] of instancedMeshesVisibleInstancesIds) {
      const instancedMesh = this.instancedMeshes.get(instancedMeshId)
      if (!instancedMesh) throw new Error('Unexpected error')

      instancedMesh.setVisibleInstances(meshInstanceIds)
    }
  }

  //   updateVisibility(entities: { expressId: ExpressId; visible: boolean }[]) {
  //     const meshesInstances: Map<MeshId, { expressId: ExpressId; visible: boolean }[]> = new Map()

  //     for (const entity of entities) {
  //       const meshId = this.expressIdToMeshId.get(entity.expressId)
  //       if (!meshId) continue

  //       let meshInstances = meshesInstances.get(meshId)
  //       if (!meshInstances) meshInstances = []
  //       meshInstances.push(entity)

  //       meshesInstances.set(meshId, meshInstances)
  //     }

  //     for (const [meshId, instances] of meshesInstances.entries()) {
  //       const mesh = this.meshes.get(meshId)
  //       if (!mesh) throw new Error(`Mesh with id ${meshId} could not be found`)

  //       mesh.updateInstanceVisibility(instances)
  //     }
  //   }
}
