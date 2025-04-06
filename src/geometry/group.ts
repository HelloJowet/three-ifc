import * as THREE from 'three'
import * as WebIfc from 'web-ifc'

import { ExpressId, InstancedMeshId, MeshInstanceId, ThreeJsInstancedMeshId } from '../types'
import { WebIfcApi } from '../webIfc'
import { InstancedMesh } from './instancedMesh'
import { MeshInstance } from './meshInstance'

/**
 * Group represents a collection of InstancedMeshes.
 * It handles creation, visibility control and Three.js grouping.
 */
export class Group {
  private instancedMeshes: Map<InstancedMeshId, InstancedMesh> = new Map()
  private threeJsInstance: THREE.Group = new THREE.Group()

  private expressIdToInstancedMeshAndMeshInstanceIds: Map<ExpressId, Set<[InstancedMeshId, MeshInstanceId]>> = new Map()
  private threeJsInstancedMeshIdToInstancedMeshId: Map<ThreeJsInstancedMeshId, InstancedMeshId> = new Map()

  constructor(webIfcApi: WebIfc.IfcAPI, excludedEntityTypes: Set<number>, includedEntityTypes?: Set<number>) {
    const expressIds = WebIfcApi.getExpressIds(webIfcApi, excludedEntityTypes, includedEntityTypes)
    this.createMeshes(webIfcApi, expressIds)
  }

  getThreeJsInstance(): THREE.Group {
    return this.threeJsInstance
  }

  /**
   * Sets visibility of mesh instances based on Express IDs
   */
  setVisibleInstances(visibleExpressIds: Set<ExpressId>) {
    const instancedMeshesVisibleInstancesIds: Map<InstancedMeshId, Set<MeshInstanceId>> = new Map()

    for (const expressId of this.expressIdToInstancedMeshAndMeshInstanceIds.keys()) {
      const instancedMeshAndMeshInstanceIds = this.expressIdToInstancedMeshAndMeshInstanceIds.get(expressId)
      if (!instancedMeshAndMeshInstanceIds) continue

      for (const [instancedMeshId, meshInstanceId] of instancedMeshAndMeshInstanceIds) {
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

  /**
   * Generates InstancedMesh objects and maps them to Express IDs
   */
  private createMeshes(webIfcApi: WebIfc.IfcAPI, expressIds: number[]) {
    const instancedMeshesInstances: Map<InstancedMeshId, Set<MeshInstance>> = new Map()

    webIfcApi.StreamMeshes(0, expressIds, (webIfcMesh) => {
      for (let i = 0; i < webIfcMesh.geometries.size(); i++) {
        const webIfcGeometry = webIfcMesh.geometries.get(i)

        const color = new THREE.Color().setRGB(webIfcGeometry.color.x, webIfcGeometry.color.y, webIfcGeometry.color.z, 'srgb')
        const transformMatrix = new THREE.Matrix4()
        transformMatrix.fromArray(webIfcGeometry.flatTransformation)
        const transparent = webIfcGeometry.color.w !== 1

        const instancedMeshId = transparent ? `${webIfcGeometry.geometryExpressID}-transparent` : webIfcGeometry.geometryExpressID.toString()
        if (!this.instancedMeshes.has(instancedMeshId))
          this.instancedMeshes.set(instancedMeshId, new InstancedMesh(webIfcApi, instancedMeshId, webIfcGeometry.geometryExpressID, transparent))

        const instancedMeshInstances = instancedMeshesInstances.get(instancedMeshId) ?? new Set()
        const newMeshInstance = new MeshInstance(true, transformMatrix, color)
        instancedMeshInstances.add(newMeshInstance)
        instancedMeshesInstances.set(instancedMeshId, instancedMeshInstances)

        const instancedMeshAndMeshInstanceIds = this.expressIdToInstancedMeshAndMeshInstanceIds.get(webIfcMesh.expressID) ?? new Set()
        instancedMeshAndMeshInstanceIds.add([instancedMeshId, newMeshInstance.id])
        this.expressIdToInstancedMeshAndMeshInstanceIds.set(webIfcMesh.expressID, instancedMeshAndMeshInstanceIds)
      }
    })

    for (const [instancedMeshId, instancedMesh] of this.instancedMeshes) {
      const instances = instancedMeshesInstances.get(instancedMeshId)
      if (!instances) throw new Error('Unexpected error')
      instancedMesh.addInstances(instances)
      this.instancedMeshes.set(instancedMeshId, instancedMesh)

      this.threeJsInstance.add(instancedMesh.threeJsInstance)
      this.threeJsInstancedMeshIdToInstancedMeshId.set(instancedMesh.threeJsInstance.id, instancedMeshId)
    }
  }
}
