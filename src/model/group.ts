import * as WebIfc from 'web-ifc'
import * as THREE from 'three'

import { MeshInstance } from './meshInstance'
import { Mesh } from './mesh'

export class Group {
  meshes: Mesh[] = []
  coordinationMatrix = new THREE.Matrix4()

  constructor(webIfcApi: WebIfc.IfcAPI, excludedEntityTypes: Set<number>, includedEntityTypes?: Set<number>) {
    const expressIds = this.getExpressIds(webIfcApi, excludedEntityTypes, includedEntityTypes)
    const meshes = this.createMeshes(webIfcApi, expressIds)
    for (const mesh of meshes.values()) this.meshes.push(mesh)

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

  private createMeshes(webIfcApi: WebIfc.IfcAPI, expressIds: number[]): Map<string, Mesh> {
    const meshes = new Map<string, Mesh>()

    webIfcApi.StreamMeshes(0, expressIds, (webIfcMesh) => {
      for (let i = 0; i < webIfcMesh.geometries.size(); i++) {
        const webIfcGeometry = webIfcMesh.geometries.get(i)

        const color = new THREE.Color().setRGB(webIfcGeometry.color.x, webIfcGeometry.color.y, webIfcGeometry.color.z, 'srgb')
        const transformMatrix = new THREE.Matrix4()
        transformMatrix.fromArray(webIfcGeometry.flatTransformation)

        const transparent = webIfcGeometry.color.w !== 1
        const meshId = transparent ? `${webIfcGeometry.geometryExpressID}-transparent` : webIfcGeometry.geometryExpressID.toString()

        let mesh = meshes.get(meshId)
        // Create mesh if it doesn't exist
        if (!mesh) mesh = new Mesh(webIfcApi, webIfcGeometry.geometryExpressID, transparent)

        mesh.instances.push(new MeshInstance(webIfcMesh.expressID, transformMatrix, color))

        meshes.set(meshId, mesh)
      }
    })

    return meshes
  }

  createThreeJsGroup(): THREE.Group {
    const group = new THREE.Group()
    for (const mesh of this.meshes) {
      group.add(mesh.createThreeJsInstancedMesh())
    }
    return group
  }
}
