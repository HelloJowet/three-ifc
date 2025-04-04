import * as THREE from 'three'

export class MeshInstance {
  visible: boolean
  matrix: THREE.Matrix4
  color: THREE.Color

  constructor(visible: boolean, matrix: THREE.Matrix4, color: THREE.Color) {
    this.visible = visible
    this.matrix = matrix
    this.color = color
  }
}
