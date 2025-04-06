import * as WebIfc from 'web-ifc'
import * as THREE from 'three'

export class WebIfcGeometry {
  static createThreeJsBufferGeometry(webIfcApi: WebIfc.IfcAPI, geometryExpressId: number): THREE.BufferGeometry {
    const geometryData = webIfcApi.GetGeometry(0, geometryExpressId)

    // Retrieve index data for faces
    const indexPointer = geometryData.GetIndexData()
    const indexSize = geometryData.GetIndexDataSize()
    const indexArray = webIfcApi.GetIndexArray(indexPointer, indexSize) as Uint32Array

    // Retrieve interleaved vertex data (position and normal)
    const vertexPointer = geometryData.GetVertexData()
    const vertexSize = geometryData.GetVertexDataSize()
    const vertexArray = webIfcApi.GetVertexArray(vertexPointer, vertexSize) as Float32Array

    const vertexCount = vertexArray.length / 6
    const positionArray = new Float32Array(vertexCount * 3)
    const normalArray = new Float32Array(vertexCount * 3)

    // Split interleaved vertex data into separate position and normal arrays
    for (let source = 0, target = 0; source < vertexArray.length; source += 6, target += 3) {
      positionArray[target] = vertexArray[source]
      positionArray[target + 1] = vertexArray[source + 1]
      positionArray[target + 2] = vertexArray[source + 2]

      normalArray[target] = vertexArray[source + 3]
      normalArray[target + 1] = vertexArray[source + 4]
      normalArray[target + 2] = vertexArray[source + 5]
    }

    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3))
    bufferGeometry.setIndex(Array.from(indexArray))

    // Free WebIFC memory
    geometryData.delete()

    return bufferGeometry
  }
}
