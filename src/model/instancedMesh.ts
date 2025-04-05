import * as THREE from 'three'
import * as WebIfc from 'web-ifc'

import { MeshInstance } from './meshInstance'
import { Geometry } from './geometry'
import { ExpressId } from '../types'

export class InstancedMesh {
  private id: string
  private transparent: boolean
  private instancesOrder: ExpressId[] = []
  private instances: Map<ExpressId, MeshInstance> = new Map()
  private threeJsInstance: THREE.InstancedMesh
  private instanceUpdateBlocked: boolean = false

  constructor(id: string, webIfcApi: WebIfc.IfcAPI, geometryExpressId: number, transparent: boolean) {
    this.id = id
    this.transparent = transparent

    const geometry = Geometry.get(webIfcApi, 0, geometryExpressId)
    const material = new THREE.MeshLambertMaterial({ transparent: transparent, opacity: transparent ? 0.5 : 1 })
    this.threeJsInstance = new THREE.InstancedMesh(geometry, material, 0)
  }

  getId(): string {
    return this.id
  }

  getThreeJsInstance(): THREE.InstancedMesh {
    return this.threeJsInstance
  }

  getExpressIds(): ExpressId[] {
    return this.instancesOrder
  }

  dispose() {
    throw new Error('Not Implemented')
  }

  update() {
    if (this.threeJsInstance.instanceColor) this.threeJsInstance.instanceColor.needsUpdate = true
    this.threeJsInstance.instanceMatrix.needsUpdate = true
  }

  addInstances(newInstances: Map<ExpressId, MeshInstance>) {
    let newVisibleInstanceExpressIds = new Set()
    for (const [expressId, instance] of newInstances.entries()) if (instance.visible) newVisibleInstanceExpressIds.add(expressId)
    for (const [expressId, instance] of this.instances.entries()) if (instance.visible) newVisibleInstanceExpressIds.add(expressId)

    const newThreeJsInstance = new THREE.InstancedMesh(this.threeJsInstance.geometry, this.threeJsInstance.material, newVisibleInstanceExpressIds.size)

    const startNewInstancesIndex = this.instances.size
    for (const [index, [expressId, instance]] of Array.from(newInstances.entries()).entries()) {
      // If instance is already part of this mesh, skip the following steps
      if (this.instances.has(expressId)) {
        console.warn(`instance with express id ${expressId} could not be found`)
        continue
      }

      newThreeJsInstance.setColorAt(startNewInstancesIndex + index, instance.color)
      newThreeJsInstance.setMatrixAt(startNewInstancesIndex + index, instance.transformationMatrix)

      this.instancesOrder.push(expressId)
      this.instances.set(expressId, instance)
    }

    const oldThreeJsInstance = this.threeJsInstance
    this.threeJsInstance = newThreeJsInstance
    oldThreeJsInstance.removeFromParent()
    oldThreeJsInstance.dispose()
  }

  removeInstances(instanceExpressIds: ExpressId[]) {
    throw new Error('Not Implemented')
  }

  setVisibleEntities(visibleExpressIds: ExpressId[]) {
    if (this.instanceUpdateBlocked) {
      console.warn('InstancedMesh can not be updated, because it is blocked')
      return
    }

    this.instanceUpdateBlocked = true

    let needsToBeUpdated = false

    for (const [expressId, instance] of this.instances.entries()) {
      if (visibleExpressIds.includes(expressId)) {
        if (instance.visible) continue
        this.threeJsInstance.count++
        instance.visible = true
      } else {
        if (!instance.visible) continue
        this.threeJsInstance.count--
        instance.visible = false
      }

      needsToBeUpdated = true
      this.changeInstanceOrder(expressId)
      this.instances.set(expressId, instance)
    }

    if (needsToBeUpdated) this.update()
    this.instanceUpdateBlocked = false
  }

  updateInstanceVisibility(instances: { expressId: ExpressId; visible: boolean }[]) {
    if (this.instanceUpdateBlocked) {
      console.warn('InstancedMesh can not be updated, because it is blocked')
      return
    }

    this.instanceUpdateBlocked = true

    let needsToBeUpdated = false

    for (const { expressId, visible } of instances) {
      const instance = this.instances.get(expressId)
      if (!instance) {
        console.warn(`instance with express id ${expressId} could not be found`)
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
      this.changeInstanceOrder(expressId)
      instance.visible = visible
      this.instances.set(expressId, instance)
    }

    if (needsToBeUpdated) this.update()
    this.instanceUpdateBlocked = false
  }

  updateInstanceTransformationMatrix(instances: { expressId: ExpressId; transformationMatrix: THREE.Matrix4 }[]) {
    throw new Error('Not Implemented')
  }

  private changeInstanceOrder(instance01ExpressId: ExpressId) {
    if (this.threeJsInstance.count === 0) return

    const instance01Index = this.instancesOrder.indexOf(instance01ExpressId)
    const instance02Index = this.threeJsInstance.count - 1
    const instance02ExpressId = this.instancesOrder[instance02Index]
    if (instance01ExpressId === instance02ExpressId) return

    const instance01 = this.instances.get(instance01ExpressId)
    const instance02 = this.instances.get(instance02ExpressId)
    if (!instance01 || !instance02) throw new Error('Instance not found')

    this.instancesOrder[instance01Index] = instance02ExpressId
    this.instancesOrder[instance02Index] = instance01ExpressId

    this.threeJsInstance.setMatrixAt(instance01Index, instance02.transformationMatrix)
    this.threeJsInstance.setMatrixAt(instance02Index, instance01.transformationMatrix)
    this.threeJsInstance.setColorAt(instance01Index, instance02.color)
    this.threeJsInstance.setColorAt(instance02Index, instance01.color)
  }
}
