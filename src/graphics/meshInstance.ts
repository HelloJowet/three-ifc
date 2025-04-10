import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

import { MeshInstanceId } from '../types'

/**
 * MeshInstance represents a single instanced mesh item.
 */
export class MeshInstance {
  id: MeshInstanceId = uuidv4()
  transformationMatrix: THREE.Matrix4
  color: THREE.Color
  isVisible: boolean = true
  isHighlighted: boolean = false
  isSelected: boolean = false

  constructor(transformationMatrix: THREE.Matrix4, color: THREE.Color) {
    this.transformationMatrix = transformationMatrix
    this.color = color
  }
}
