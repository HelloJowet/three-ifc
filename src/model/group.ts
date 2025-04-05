import * as WebIfc from 'web-ifc'
import * as THREE from 'three'

import { MeshInstance } from './meshInstance'
import { InstancedMesh } from './instancedMesh'
import { ExpressId, MeshId, ThreeJsMeshId } from '../types'

export class Group {
  private expressIdToMeshId: Map<ExpressId, MeshId> = new Map()
  private threeJsMeshIdToMeshId: Map<ThreeJsMeshId, MeshId> = new Map()
  private meshes: Map<MeshId, InstancedMesh> = new Map()
  // TODO: coordinationMatrix needs to be implemented
  private coordinationMatrix = new THREE.Matrix4()
  private threeJsInstance: THREE.Group = new THREE.Group()

  constructor(webIfcApi: WebIfc.IfcAPI, excludedEntityTypes: Set<number>, includedEntityTypes?: Set<number>) {
    const expressIds = this.getExpressIds(webIfcApi, excludedEntityTypes, includedEntityTypes)
    const meshes = this.createMeshes(webIfcApi, expressIds)
    for (const mesh of meshes) {
      const meshId = mesh.getId()
      const meshThreeJsInstance = mesh.getThreeJsInstance()

      for (const expressId of mesh.getExpressIds()) this.expressIdToMeshId.set(expressId, meshId)

      this.threeJsMeshIdToMeshId.set(meshThreeJsInstance.id, meshId)
      this.meshes.set(meshId, mesh)
      this.threeJsInstance.add(meshThreeJsInstance)
    }

    const matrix = webIfcApi.GetCoordinationMatrix(0)
    this.coordinationMatrix.fromArray(matrix)
  }

  getThreeJsInstance(): THREE.Group {
    return this.threeJsInstance
  }

  setVisibleEntities(visibleExpressIds: ExpressId[]) {
    const meshesInstancesVisibleExpressIds: Map<MeshId, ExpressId[]> = new Map()

    for (const expressId of visibleExpressIds) {
      const meshId = this.expressIdToMeshId.get(expressId)
      if (!meshId) continue

      let meshInstancesVisibleExpressIds = meshesInstancesVisibleExpressIds.get(meshId)
      if (!meshInstancesVisibleExpressIds) meshInstancesVisibleExpressIds = []
      meshInstancesVisibleExpressIds.push(expressId)

      meshesInstancesVisibleExpressIds.set(meshId, meshInstancesVisibleExpressIds)
    }

    for (const [meshId, mesh] of this.meshes.entries()) {
      let visibleExpressIds = meshesInstancesVisibleExpressIds.get(meshId)
      if (!visibleExpressIds) visibleExpressIds = []

      mesh.setVisibleEntities(visibleExpressIds)
    }
  }

  updateVisibility(entities: { expressId: ExpressId; visible: boolean }[]) {
    const meshesInstances: Map<MeshId, { expressId: ExpressId; visible: boolean }[]> = new Map()

    for (const entity of entities) {
      const meshId = this.expressIdToMeshId.get(entity.expressId)
      if (!meshId) continue

      let meshInstances = meshesInstances.get(meshId)
      if (!meshInstances) meshInstances = []
      meshInstances.push(entity)

      meshesInstances.set(meshId, meshInstances)
    }

    for (const [meshId, instances] of meshesInstances.entries()) {
      const mesh = this.meshes.get(meshId)
      if (!mesh) throw new Error(`Mesh with id ${meshId} could not be found`)

      mesh.updateInstanceVisibility(instances)
    }
  }

  // get all express ids that fit in the excludedEntityTypes and includedEntityTypes lists
  private getExpressIds(webIfcApi: WebIfc.IfcAPI, excludedEntityTypes: Set<number>, includedEntityTypes?: Set<number>): number[] {
    const entityTypes = webIfcApi.GetIfcEntityList(0)

    const expressIds: number[] = []
    for (const entityType of entityTypes) {
      if (!webIfcApi.IsIfcElement(entityType) && entityType !== WebIfc.IFCSPACE) continue

      if (includedEntityTypes && !includedEntityTypes.has(entityType)) continue
      else if (excludedEntityTypes.has(entityType)) continue

      const expressIdsOfEntityType = webIfcApi.GetLineIDsWithType(0, entityType)

      for (const expressId of expressIdsOfEntityType) expressIds.push(expressId)
    }

    return expressIds
  }

  private createMeshes(webIfcApi: WebIfc.IfcAPI, expressIds: number[]): InstancedMesh[] {
    const meshesAndInstances: { [meshId: MeshId]: { mesh: InstancedMesh; instances: Map<number, MeshInstance> } } = {}

    webIfcApi.StreamMeshes(0, expressIds, (webIfcMesh) => {
      for (let i = 0; i < webIfcMesh.geometries.size(); i++) {
        const webIfcGeometry = webIfcMesh.geometries.get(i)

        const color = new THREE.Color().setRGB(webIfcGeometry.color.x, webIfcGeometry.color.y, webIfcGeometry.color.z, 'srgb')
        const transformMatrix = new THREE.Matrix4()
        transformMatrix.fromArray(webIfcGeometry.flatTransformation)

        const transparent = webIfcGeometry.color.w !== 1
        const meshId = transparent ? `${webIfcGeometry.geometryExpressID}-transparent` : webIfcGeometry.geometryExpressID.toString()

        let meshAndInstances = meshesAndInstances[meshId]
        // Create mesh if it doesn't exist
        if (!meshAndInstances) meshAndInstances = { mesh: new InstancedMesh(meshId, webIfcApi, webIfcGeometry.geometryExpressID, transparent), instances: new Map() }
        meshAndInstances.instances.set(webIfcMesh.expressID, new MeshInstance(true, transformMatrix, color))
        meshAndInstances.mesh

        meshesAndInstances[meshId] = meshAndInstances
      }
    })

    let meshes = Object.values(meshesAndInstances).map((meshAndInstances) => {
      meshAndInstances.mesh.addInstances(meshAndInstances.instances)
      return meshAndInstances.mesh
    })

    return meshes
  }
}
