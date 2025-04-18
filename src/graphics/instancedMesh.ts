import * as THREE from 'three'

import { InstancedMeshId, MeshInstanceId } from '../types'
import { Geometry } from './geometry'
import { Material } from './material'
import { MeshInstance } from './meshInstance'

/**
 * InstancedMesh represents a single Three.js InstancedMesh with tracking of visible/invisible instances.
 */
export class InstancedMesh {
  id: InstancedMeshId
  geometry: Geometry
  material: Material

  instancesOrder: MeshInstanceId[] = []
  instances: Map<MeshInstanceId, MeshInstance> = new Map()
  threeJsInstance: THREE.InstancedMesh
  instanceUpdateBlocked: boolean = false

  constructor(id: InstancedMeshId, geometry: Geometry, material: Material) {
    this.id = id
    this.geometry = geometry
    this.material = material

    this.threeJsInstance = new THREE.InstancedMesh(geometry.toThreeJsInstance(), material.toThreeJsInstance(), 0)
    this.threeJsInstance.userData = { isPartOfThreeJs: true, instancedMeshId: id }
  }

  addInstances(newInstances: Set<MeshInstance>) {
    let newVisibleInstanceIds = new Set()
    for (const newInstance of newInstances) if (newInstance.isVisible) newVisibleInstanceIds.add(newInstance.id)
    for (const [instanceId, instance] of this.instances) if (instance.isVisible) newVisibleInstanceIds.add(instanceId)

    const newThreeJsInstance = new THREE.InstancedMesh(this.threeJsInstance.geometry, this.threeJsInstance.material, newVisibleInstanceIds.size)

    const startNewInstancesIndex = this.instances.size
    for (const [index, instance] of Array.from(newInstances.values()).entries()) {
      // If instance is already part of this mesh, skip the following steps
      if (this.instances.has(instance.id)) {
        console.warn(`mesh instance with the id ${instance.id} is already part of this instanced mesh`)
        continue
      }

      newThreeJsInstance.setColorAt(startNewInstancesIndex + index, instance.color)
      newThreeJsInstance.setMatrixAt(startNewInstancesIndex + index, instance.transformationMatrix)

      this.instancesOrder.push(instance.id)
      this.instances.set(instance.id, instance)
    }

    const oldThreeJsInstance = this.threeJsInstance
    this.threeJsInstance = newThreeJsInstance
    this.threeJsInstance.userData = oldThreeJsInstance.userData
    oldThreeJsInstance.removeFromParent()
    oldThreeJsInstance.dispose()
  }

  /**
   * Sets visible instances and rebuilds the buffer to match
   */
  setVisibleInstances(visibleInstanceIds: Set<MeshInstanceId>) {
    if (this.instanceUpdateBlocked) {
      console.warn('InstancedMesh can not be updated, because it is blocked')
      return
    }

    this.instanceUpdateBlocked = true
    let needsToBeUpdated = false

    const visibleInstances: MeshInstance[] = []
    const invisibleInstances: MeshInstance[] = []

    for (const [instanceId, instance] of this.instances) {
      if (visibleInstanceIds.has(instanceId)) {
        visibleInstances.push(instance)
        if (instance.isVisible) continue
        instance.isVisible = true
      } else {
        invisibleInstances.push(instance)
        if (!instance.isVisible) continue
        instance.isVisible = false
      }

      this.instances.set(instanceId, instance)
      needsToBeUpdated = true
    }

    if (needsToBeUpdated) {
      // Reset order: visible first, then invisible
      this.instancesOrder = [...visibleInstances.map((i) => i.id), ...invisibleInstances.map((i) => i.id)]

      // Re-populate buffer with visible instances only
      this.threeJsInstance.count = visibleInstances.length

      for (const [index, instance] of visibleInstances.entries()) {
        this.threeJsInstance.setMatrixAt(index, instance.transformationMatrix)
        this.threeJsInstance.setColorAt(index, instance.color)
      }

      if (this.threeJsInstance.instanceColor) this.threeJsInstance.instanceColor.needsUpdate = true
      this.threeJsInstance.instanceMatrix.needsUpdate = true
    }

    this.instanceUpdateBlocked = false
  }

  updateInstanceSelectState(meshInstanceId: MeshInstanceId, selected: boolean, color: THREE.Color, triggerThreeJsInstanceUpdate: boolean = true) {
    const meshInstance = this.instances.get(meshInstanceId)
    if (!meshInstance) throw new Error(`Mesh instance with the id ${meshInstanceId} in the instanced mesh with the id ${this.id} could not be found`)

    if (meshInstance.isSelected === selected) return
    meshInstance.isSelected = selected
    this.instances.set(meshInstanceId, meshInstance)

    const meshInstanceIndex = this.instancesOrder.indexOf(meshInstanceId)
    if (selected) this.threeJsInstance.setColorAt(meshInstanceIndex, color)
    else this.threeJsInstance.setColorAt(meshInstanceIndex, meshInstance.color)

    if (triggerThreeJsInstanceUpdate && this.threeJsInstance.instanceColor != undefined) this.threeJsInstance.instanceColor.needsUpdate = true
  }

  updateInstanceHighlightState(meshInstanceId: MeshInstanceId, highlighted: boolean, color: THREE.Color, triggerThreeJsInstanceUpdate: boolean = true) {
    const meshInstance = this.instances.get(meshInstanceId)
    if (!meshInstance) throw new Error(`Mesh instance with the id ${meshInstanceId} in the instanced mesh with the id ${this.id} could not be found`)

    if (meshInstance.isHighlighted === highlighted) return
    meshInstance.isHighlighted = highlighted
    this.instances.set(meshInstanceId, meshInstance)

    if (meshInstance.isSelected) return

    const meshInstanceIndex = this.instancesOrder.indexOf(meshInstanceId)
    if (highlighted) this.threeJsInstance.setColorAt(meshInstanceIndex, color)
    else this.threeJsInstance.setColorAt(meshInstanceIndex, meshInstance.color)

    if (triggerThreeJsInstanceUpdate && this.threeJsInstance.instanceColor != undefined) this.threeJsInstance.instanceColor.needsUpdate = true
  }

  checkIfCompletelyInvisible(): boolean {
    for (const instance of this.instances.values()) {
      if (instance.isVisible) return false
    }

    return true
  }
}
