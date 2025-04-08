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
  }

  update() {
    if (this.threeJsInstance.instanceColor) this.threeJsInstance.instanceColor.needsUpdate = true
    this.threeJsInstance.instanceMatrix.needsUpdate = true
  }

  addInstances(newInstances: Set<MeshInstance>) {
    let newVisibleInstanceIds = new Set()
    for (const newInstance of newInstances) if (newInstance.visible) newVisibleInstanceIds.add(newInstance.id)
    for (const [instanceId, instance] of this.instances) if (instance.visible) newVisibleInstanceIds.add(instanceId)

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
        if (instance.visible) continue
        instance.visible = true
      } else {
        invisibleInstances.push(instance)
        if (!instance.visible) continue
        instance.visible = false
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

      this.update()
    }

    this.instanceUpdateBlocked = false
  }

  updateInstanceVisibility(instances: { instanceId: MeshInstanceId; visible: boolean }[]) {
    if (this.instanceUpdateBlocked) {
      console.warn('InstancedMesh can not be updated, because it is blocked')
      return
    }

    this.instanceUpdateBlocked = true

    let needsToBeUpdated = false

    for (const { instanceId, visible } of instances) {
      const instance = this.instances.get(instanceId)
      if (!instance) {
        console.warn(`mesh instance with the id ${instanceId} could not be found`)
        continue
      }

      if (visible) {
        if (instance.visible) continue
        this.threeJsInstance.count++
      } else {
        if (!instance.visible) continue
        this.threeJsInstance.count--
      }

      needsToBeUpdated = true
      this.changeInstanceOrder(instanceId)
      instance.visible = visible
      this.instances.set(instanceId, instance)
    }

    if (needsToBeUpdated) this.update()
    this.instanceUpdateBlocked = false
  }

  private changeInstanceOrder(instance01Id: MeshInstanceId) {
    if (this.threeJsInstance.count === 0) return

    const instance01Index = this.instancesOrder.indexOf(instance01Id)
    const instance02Index = this.threeJsInstance.count - 1
    const instance02Id = this.instancesOrder[instance02Index]
    if (instance01Id === instance02Id) return

    const instance01 = this.instances.get(instance01Id)
    const instance02 = this.instances.get(instance02Id)
    if (!instance01 || !instance02) throw new Error('Instance not found')

    this.instancesOrder[instance01Index] = instance02Id
    this.instancesOrder[instance02Index] = instance01Id

    this.threeJsInstance.setMatrixAt(instance01Index, instance02.transformationMatrix)
    this.threeJsInstance.setMatrixAt(instance02Index, instance01.transformationMatrix)
    this.threeJsInstance.setColorAt(instance01Index, instance02.color)
    this.threeJsInstance.setColorAt(instance02Index, instance01.color)
  }
}
