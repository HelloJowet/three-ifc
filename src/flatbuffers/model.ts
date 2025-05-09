// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers'

import { EntityInstance } from './entity-instance'
import { Group } from './group'
import { Metadata } from './metadata'
import { SpatialStructure } from './spatial-structure'

export class Model {
  bb: flatbuffers.ByteBuffer | null = null
  bb_pos = 0
  __init(i: number, bb: flatbuffers.ByteBuffer): Model {
    this.bb_pos = i
    this.bb = bb
    return this
  }

  static getRootAsModel(bb: flatbuffers.ByteBuffer, obj?: Model): Model {
    return (obj || new Model()).__init(bb.readInt32(bb.position()) + bb.position(), bb)
  }

  static getSizePrefixedRootAsModel(bb: flatbuffers.ByteBuffer, obj?: Model): Model {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH)
    return (obj || new Model()).__init(bb.readInt32(bb.position()) + bb.position(), bb)
  }

  id(): string | null
  id(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  id(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 4)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  group(obj?: Group): Group | null {
    const offset = this.bb!.__offset(this.bb_pos, 6)
    return offset ? (obj || new Group()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null
  }

  entityInstances(index: number, obj?: EntityInstance): EntityInstance | null {
    const offset = this.bb!.__offset(this.bb_pos, 8)
    return offset ? (obj || new EntityInstance()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null
  }

  entityInstancesLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 8)
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0
  }

  spatialStructure(obj?: SpatialStructure): SpatialStructure | null {
    const offset = this.bb!.__offset(this.bb_pos, 10)
    return offset ? (obj || new SpatialStructure()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null
  }

  metadata(obj?: Metadata): Metadata | null {
    const offset = this.bb!.__offset(this.bb_pos, 12)
    return offset ? (obj || new Metadata()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null
  }

  static startModel(builder: flatbuffers.Builder) {
    builder.startObject(5)
  }

  static addId(builder: flatbuffers.Builder, idOffset: flatbuffers.Offset) {
    builder.addFieldOffset(0, idOffset, 0)
  }

  static addGroup(builder: flatbuffers.Builder, groupOffset: flatbuffers.Offset) {
    builder.addFieldOffset(1, groupOffset, 0)
  }

  static addEntityInstances(builder: flatbuffers.Builder, entityInstancesOffset: flatbuffers.Offset) {
    builder.addFieldOffset(2, entityInstancesOffset, 0)
  }

  static createEntityInstancesVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset {
    builder.startVector(4, data.length, 4)
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]!)
    }
    return builder.endVector()
  }

  static startEntityInstancesVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4)
  }

  static addSpatialStructure(builder: flatbuffers.Builder, spatialStructureOffset: flatbuffers.Offset) {
    builder.addFieldOffset(3, spatialStructureOffset, 0)
  }

  static addMetadata(builder: flatbuffers.Builder, metadataOffset: flatbuffers.Offset) {
    builder.addFieldOffset(4, metadataOffset, 0)
  }

  static endModel(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject()
    builder.requiredField(offset, 4) // id
    builder.requiredField(offset, 6) // group
    builder.requiredField(offset, 8) // entity_instances
    builder.requiredField(offset, 10) // spatial_structure
    builder.requiredField(offset, 12) // metadata
    return offset
  }

  static finishModelBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset) {
    builder.finish(offset)
  }

  static finishSizePrefixedModelBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset) {
    builder.finish(offset, undefined, true)
  }
}
