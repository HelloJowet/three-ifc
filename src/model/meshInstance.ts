import * as THREE from 'three'

export class MeshInstance {
  expressId: number
  matrix: THREE.Matrix4
  color: THREE.Color

  constructor(expressId: number, matrix: THREE.Matrix4, color: THREE.Color) {
    this.expressId = expressId
    this.matrix = matrix
    this.color = color
  }
}
