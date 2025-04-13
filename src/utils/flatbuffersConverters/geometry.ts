import * as flatbuffers from 'flatbuffers'

import { Geometry as FlatbuffersGeometry } from '../../flatbuffers/schema'
import { Geometry } from '../../graphics'

export class FlatbuffersGeometryConverter {
  static toFlatbuffersBinary(geometry: Geometry): Uint8Array {
    const builder = new flatbuffers.Builder()

    const vertices = FlatbuffersGeometry.createVerticesVector(builder, geometry.vertices)
    const normals = FlatbuffersGeometry.createNormalsVector(builder, geometry.normals)
    const indices = FlatbuffersGeometry.createIndicesVector(builder, geometry.indices)
    FlatbuffersGeometry.startGeometry(builder)
    FlatbuffersGeometry.addVertices(builder, vertices)
    FlatbuffersGeometry.addNormals(builder, normals)
    FlatbuffersGeometry.addIndices(builder, indices)
    const flatbuffersOffset = FlatbuffersGeometry.endGeometry(builder)

    builder.finish(flatbuffersOffset)

    return builder.asUint8Array()
  }
}
