import * as WebIfc from 'web-ifc'

import { Geometry } from '../../graphics'

export class WebIfcGeometryConverter {
  static convert(webIfcApi: WebIfc.IfcAPI, webIfcGeometry: WebIfc.IfcGeometry): Geometry {
    // Retrieve index data for faces
    const indexPointer = webIfcGeometry.GetIndexData()
    const indexSize = webIfcGeometry.GetIndexDataSize()
    const indices = webIfcApi.GetIndexArray(indexPointer, indexSize) as Uint32Array

    // Retrieve interleaved vertex data (position and normal)
    const vertexPointer = webIfcGeometry.GetVertexData()
    const vertexSize = webIfcGeometry.GetVertexDataSize()
    const interleaved = webIfcApi.GetVertexArray(vertexPointer, vertexSize) as Float32Array

    const vertexCount = interleaved.length / 6
    const vertices = new Float32Array(vertexCount * 3)
    const normals = new Float32Array(vertexCount * 3)

    // Split interleaved vertex data into separate position and normal arrays
    for (let source = 0, target = 0; source < interleaved.length; source += 6, target += 3) {
      vertices[target] = interleaved[source]
      vertices[target + 1] = interleaved[source + 1]
      vertices[target + 2] = interleaved[source + 2]

      normals[target] = interleaved[source + 3]
      normals[target + 1] = interleaved[source + 4]
      normals[target + 2] = interleaved[source + 5]
    }

    return new Geometry(vertices, normals, indices)
  }
}
