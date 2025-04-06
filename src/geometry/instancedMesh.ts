import * as WebIfc from 'web-ifc'
import * as THREE from 'three'

import { InstancedMeshId, MeshInstanceId } from '../types'
import { MeshInstance } from './meshInstance'
import { WebIfcGeometry } from '../webIfc'

export class InstancedMesh {
  id: InstancedMeshId
  transparent: boolean
  instancesOrder: MeshInstanceId[] = []
  instances: Map<MeshInstanceId, MeshInstance> = new Map()
  threeJsInstance: THREE.InstancedMesh
  instanceUpdateBlocked: boolean = false

  constructor(webIfcApi: WebIfc.IfcAPI, id: InstancedMeshId, geometryExpressId: number, transparent: boolean) {
    this.id = id
    this.transparent = transparent

    const geometry = WebIfcGeometry.createThreeJsBufferGeometry(webIfcApi, geometryExpressId)
    const material = new THREE.MeshLambertMaterial({ transparent: transparent, opacity: transparent ? 0.5 : 1 })
    this.threeJsInstance = new THREE.InstancedMesh(geometry, material, 0)
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
        if (instance.visible) continue
        instance.visible = true
        visibleInstances.push(instance)
      } else {
        if (!instance.visible) continue
        instance.visible = false
        invisibleInstances.push(instance)
      }

      needsToBeUpdated = true
    }

    if (needsToBeUpdated) {
      // Reset order: visible first, then invisible
      this.instancesOrder = [...visibleInstances.map((i) => i.id), ...invisibleInstances.map((i) => i.id)]

      // Re-populate buffer with visible instances only
      const newCount = visibleInstances.length
      this.threeJsInstance.count = newCount

      for (let i = 0; i < visibleInstances.length; i++) {
        const instance = visibleInstances[i]
        this.threeJsInstance.setMatrixAt(i, instance.transformationMatrix)
        this.threeJsInstance.setColorAt(i, instance.color)
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
