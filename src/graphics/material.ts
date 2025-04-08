import * as THREE from 'three'

export class Material {
  opacity: number

  constructor(opacity: number) {
    this.opacity = opacity
  }

  toThreeJsInstance(): THREE.MeshLambertMaterial {
    return new THREE.MeshLambertMaterial({ transparent: this.opacity != 1, opacity: this.opacity })
  }
}
