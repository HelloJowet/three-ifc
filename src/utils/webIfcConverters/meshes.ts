import * as THREE from 'three'
import * as WebIfc from 'web-ifc'

import { EntityInstance } from '../../entityInstance'
import { InstancedMesh, Material, MeshInstance } from '../../graphics'
import { ExpressId, InstancedMeshId } from '../../types'
import { WebIfcGeometryConverter } from './geometry'

export class WebIfcMeshesConverter {
  static convertToInstancedMeshes(
    webIfcApi: WebIfc.IfcAPI,
    expressIds: ExpressId[],
    entityInstances: Map<ExpressId, EntityInstance>,
  ): [Map<InstancedMeshId, InstancedMesh>, Map<ExpressId, EntityInstance>] {
    const instancedMeshes: Map<InstancedMeshId, InstancedMesh> = new Map()
    const instancedMeshesInstances: Map<InstancedMeshId, Set<MeshInstance>> = new Map()

    webIfcApi.StreamMeshes(0, expressIds, (webIfcMesh) => {
      for (let i = 0; i < webIfcMesh.geometries.size(); i++) {
        const webIfcPlacedGeometry = webIfcMesh.geometries.get(i)

        // create instanced mesh if not exist
        const instancedMeshId = `${webIfcPlacedGeometry.geometryExpressID}-${webIfcPlacedGeometry.color.w}`
        if (!instancedMeshes.has(instancedMeshId)) {
          const webIfcGeometry = webIfcApi.GetGeometry(0, webIfcPlacedGeometry.geometryExpressID)
          const geometry = WebIfcGeometryConverter.convert(webIfcApi, webIfcGeometry)
          const material = new Material(webIfcPlacedGeometry.color.w)

          instancedMeshes.set(instancedMeshId, new InstancedMesh(instancedMeshId, geometry, material))
        }

        const color = new THREE.Color().setRGB(webIfcPlacedGeometry.color.x, webIfcPlacedGeometry.color.y, webIfcPlacedGeometry.color.z, 'srgb')
        const transformMatrix = new THREE.Matrix4()
        transformMatrix.fromArray(webIfcPlacedGeometry.flatTransformation)

        const instancedMeshInstances = instancedMeshesInstances.get(instancedMeshId) ?? new Set()
        const newMeshInstance = new MeshInstance(transformMatrix, color)
        instancedMeshInstances.add(newMeshInstance)
        instancedMeshesInstances.set(instancedMeshId, instancedMeshInstances)

        const entityInstance = entityInstances.get(webIfcMesh.expressID)
        if (!entityInstance) continue
        entityInstance.instancedMeshAndMeshInstanceIds.add([instancedMeshId, newMeshInstance.id])
        entityInstances.set(webIfcMesh.expressID, entityInstance)
      }
    })

    for (const [instancedMeshId, instancedMesh] of instancedMeshes) {
      const instances = instancedMeshesInstances.get(instancedMeshId)
      if (!instances) throw new Error('Unexpected error')
      instancedMesh.addInstances(instances)
      instancedMeshes.set(instancedMeshId, instancedMesh)
    }

    return [instancedMeshes, entityInstances]
  }
}
