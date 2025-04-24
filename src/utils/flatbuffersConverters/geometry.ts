import * as flatbuffers from 'flatbuffers'

import { Geometry as FlatbuffersGeometry } from '../../flatbuffers/schema'
import { Geometry } from '../../graphics'

export class FlatbuffersGeometryConverter {
  static toFlatbuffersBinary(geometry: Geometry): Uint8Array {
    const builder = new flatbuffers.Builder()
    const vertexOffset = FlatbuffersGeometry.createVerticesVector(builder, geometry.vertices)
    const normalOffset = FlatbuffersGeometry.createNormalsVector(builder, geometry.normals)
    const indexOffset = FlatbuffersGeometry.createIndicesVector(builder, geometry.indices)
    const geometryOffset = FlatbuffersGeometry.createGeometry(builder, vertexOffset, normalOffset, indexOffset)
    builder.finish(geometryOffset)
    return builder.asUint8Array()
  }

  static fromFlatbuffersBinary(buffer: Uint8Array<ArrayBufferLike>): Geometry {
    const byteBuffer = new flatbuffers.ByteBuffer(buffer)
    const flatbuffersGeometry = FlatbuffersGeometry.getRootAsGeometry(byteBuffer)

    const vertices = flatbuffersGeometry.verticesArray()
    const normals = flatbuffersGeometry.normalsArray()
    const indices = flatbuffersGeometry.indicesArray()
    if (vertices == null || normals == null || indices == null) throw new Error('Failed to convert flatbuffers binary to geometry')

    return new Geometry(vertices, normals, indices)
  }
}
