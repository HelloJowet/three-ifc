import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

import { MeshInstanceId } from '../types'

export class MeshInstance {
  id: MeshInstanceId = uuidv4()
  visible: boolean
  transformationMatrix: THREE.Matrix4
  color: THREE.Color

  constructor(visible: boolean, transformationMatrix: THREE.Matrix4, color: THREE.Color) {
    this.visible = visible
    this.transformationMatrix = transformationMatrix
    this.color = color
  }
}
