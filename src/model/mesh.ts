import * as THREE from 'three'
import * as WebIfc from 'web-ifc'

import { MeshInstance } from './meshInstance'
import { Geometry } from './geometry'

export class Mesh {
  instances: MeshInstance[] = []
  geometry: THREE.BufferGeometry
  material: THREE.MeshLambertMaterial

  constructor(webIfcApi: WebIfc.IfcAPI, geometryExpressId: number, transparent: boolean) {
    this.geometry = Geometry.get(webIfcApi, 0, geometryExpressId)
    this.material = new THREE.MeshLambertMaterial({ transparent: transparent, opacity: transparent ? 0.5 : 1 })
  }

  createThreeJsInstancedMesh(): THREE.InstancedMesh {
    const instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, this.instances.length)

    this.instances.map((instance, index) => {
      instancedMesh.setColorAt(index, instance.color)
      instancedMesh.setMatrixAt(index, instance.matrix)
    })

    return instancedMesh
  }
}
