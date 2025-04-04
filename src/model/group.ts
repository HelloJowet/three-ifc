import * as WebIfc from 'web-ifc'
import * as THREE from 'three'

import { MeshInstance } from './meshInstance'
import { InstancedMesh } from './instancedMesh'

export class Group {
  private meshes: InstancedMesh[] = []
  coordinationMatrix = new THREE.Matrix4()
  threeJsInstance: THREE.Group = new THREE.Group()

  constructor(webIfcApi: WebIfc.IfcAPI, excludedEntityTypes: Set<number>, includedEntityTypes?: Set<number>) {
    const expressIds = this.getExpressIds(webIfcApi, excludedEntityTypes, includedEntityTypes)
    this.meshes = this.createMeshes(webIfcApi, expressIds)

    for (const mesh of this.meshes.values()) this.threeJsInstance.add(mesh.threeJsInstance)

    const matrix = webIfcApi.GetCoordinationMatrix(0)
    this.coordinationMatrix.fromArray(matrix)
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
    const meshesAndInstances: { [meshId: string]: { mesh: InstancedMesh; instances: { [expressId: number]: MeshInstance } } } = {}

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
        if (!meshAndInstances) meshAndInstances = { mesh: new InstancedMesh(webIfcApi, webIfcGeometry.geometryExpressID, transparent), instances: {} }
        meshAndInstances.instances[webIfcMesh.expressID] = new MeshInstance(true, transformMatrix, color)

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
