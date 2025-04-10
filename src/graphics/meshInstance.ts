import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

import { ExpressId, MeshInstanceId } from '../types'

/**
 * MeshInstance represents a single instanced mesh item.
 */
export class MeshInstance {
  id: MeshInstanceId = uuidv4()
  expressId: ExpressId
  transformationMatrix: THREE.Matrix4
  color: THREE.Color
  isVisible: boolean = true
  isHighlighted: boolean = false
  isSelected: boolean = false

  constructor(expressId: ExpressId, transformationMatrix: THREE.Matrix4, color: THREE.Color) {
    this.expressId = expressId
    this.transformationMatrix = transformationMatrix
    this.color = color
  }
}
