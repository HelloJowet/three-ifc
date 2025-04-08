import * as THREE from 'three'

export class Geometry {
  vertices: Float32Array
  normals: Float32Array
  indices: Uint32Array

  constructor(vertices: Float32Array, normals: Float32Array, indices: Uint32Array) {
    this.vertices = vertices
    this.normals = normals
    this.indices = indices
  }

  toThreeJsInstance(): THREE.BufferGeometry {
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3))
    bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(this.normals, 3))
    bufferGeometry.setIndex(Array.from(this.indices))
    return bufferGeometry
  }
}
