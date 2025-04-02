import * as WebIfc from 'web-ifc'
import * as THREE from 'three'

export class Geometry {
  static get(webIfcApi: WebIfc.IfcAPI, modelId: number, geometryExpressId: number) {
    const geometry = webIfcApi.GetGeometry(modelId, geometryExpressId)

    const index = webIfcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize()) as Uint32Array

    const vertexData = webIfcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize()) as Float32Array

    const position = new Float32Array(vertexData.length / 2)
    const normal = new Float32Array(vertexData.length / 2)

    for (let i = 0; i < vertexData.length; i += 6) {
      position[i / 2] = vertexData[i]
      position[i / 2 + 1] = vertexData[i + 1]
      position[i / 2 + 2] = vertexData[i + 2]

      normal[i / 2] = vertexData[i + 3]
      normal[i / 2 + 1] = vertexData[i + 4]
      normal[i / 2 + 2] = vertexData[i + 5]
    }

    const bufferGeometry = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(position, 3)
    const norAttr = new THREE.BufferAttribute(normal, 3)
    bufferGeometry.setAttribute('position', posAttr)
    bufferGeometry.setAttribute('normal', norAttr)
    bufferGeometry.setIndex(Array.from(index))

    geometry.delete()

    return bufferGeometry
  }
}
