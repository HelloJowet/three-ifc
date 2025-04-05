import * as THREE from 'three'

export class MeshInstance {
  visible: boolean
  transformationMatrix: THREE.Matrix4
  color: THREE.Color

  constructor(visible: boolean, transformationMatrix: THREE.Matrix4, color: THREE.Color) {
    this.visible = visible
    this.transformationMatrix = transformationMatrix
    this.color = color
  }
}
