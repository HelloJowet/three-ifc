import * as THREE from 'three'
import * as WebIfc from 'web-ifc'

import { MeshInstance } from './meshInstance'
import { Geometry } from './geometry'

export class InstancedMesh {
  private instances: { [expressId: number]: MeshInstance } = {}
  threeJsInstance: THREE.InstancedMesh

  constructor(webIfcApi: WebIfc.IfcAPI, geometryExpressId: number, transparent: boolean) {
    const geometry = Geometry.get(webIfcApi, 0, geometryExpressId)
    const material = new THREE.MeshLambertMaterial({ transparent: transparent, opacity: transparent ? 0.5 : 1 })
    this.threeJsInstance = new THREE.InstancedMesh(geometry, material, 0)
  }

  update() {
    if (this.threeJsInstance.instanceColor) this.threeJsInstance.instanceColor.needsUpdate = true
    this.threeJsInstance.instanceMatrix.needsUpdate = true
  }

  addInstances(instances: { [expressId: number]: MeshInstance }) {
    let newVisibleInstanceExpressIds = new Set()
    for (const [expressId, instance] of Object.entries(instances)) if (instance.visible) newVisibleInstanceExpressIds.add(expressId)
    for (const [expressId, instance] of Object.entries(this.instances)) if (instance.visible) newVisibleInstanceExpressIds.add(expressId)

    const newThreeJsInstance = new THREE.InstancedMesh(this.threeJsInstance.geometry, this.threeJsInstance.material, newVisibleInstanceExpressIds.size)

    const startInstanceIndex = Object.keys(this.instances).length
    for (const [index, [expressId, instance]] of Object.entries(instances).entries()) {
      // If instance is already part of this mesh, skip the following steps
      if (Object.keys(this.instances).includes(expressId)) continue

      newThreeJsInstance.setColorAt(startInstanceIndex + index, instance.color)
      newThreeJsInstance.setMatrixAt(startInstanceIndex + index, instance.matrix)
    }

    const oldThreeJsInstance = this.threeJsInstance
    this.threeJsInstance = newThreeJsInstance
    oldThreeJsInstance.removeFromParent()
    oldThreeJsInstance.dispose()
  }
}
