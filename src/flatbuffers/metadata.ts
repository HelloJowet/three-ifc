// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers'

import { Property } from './property'

export class Metadata {
  bb: flatbuffers.ByteBuffer | null = null
  bb_pos = 0
  __init(i: number, bb: flatbuffers.ByteBuffer): Metadata {
    this.bb_pos = i
    this.bb = bb
    return this
  }

  static getRootAsMetadata(bb: flatbuffers.ByteBuffer, obj?: Metadata): Metadata {
    return (obj || new Metadata()).__init(bb.readInt32(bb.position()) + bb.position(), bb)
  }

  static getSizePrefixedRootAsMetadata(bb: flatbuffers.ByteBuffer, obj?: Metadata): Metadata {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH)
    return (obj || new Metadata()).__init(bb.readInt32(bb.position()) + bb.position(), bb)
  }

  name(): string | null
  name(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  name(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 4)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  schema(): string | null
  schema(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  schema(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 6)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  creationDate(): string | null
  creationDate(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  creationDate(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 8)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  authorName(): string | null
  authorName(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  authorName(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 10)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  authorEmail(): string | null
  authorEmail(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  authorEmail(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 12)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  organization(): string | null
  organization(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  organization(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 14)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  preprocessorVersion(): string | null
  preprocessorVersion(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  preprocessorVersion(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 16)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  originatingSystem(): string | null
  originatingSystem(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  originatingSystem(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 18)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  authorization(): string | null
  authorization(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null
  authorization(optionalEncoding?: any): string | Uint8Array | null {
    const offset = this.bb!.__offset(this.bb_pos, 20)
    return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null
  }

  descriptions(index: number, obj?: Property): Property | null {
    const offset = this.bb!.__offset(this.bb_pos, 22)
    return offset ? (obj || new Property()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null
  }

  descriptionsLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 22)
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0
  }

  static startMetadata(builder: flatbuffers.Builder) {
    builder.startObject(10)
  }

  static addName(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset) {
    builder.addFieldOffset(0, nameOffset, 0)
  }

  static addSchema(builder: flatbuffers.Builder, schemaOffset: flatbuffers.Offset) {
    builder.addFieldOffset(1, schemaOffset, 0)
  }

  static addCreationDate(builder: flatbuffers.Builder, creationDateOffset: flatbuffers.Offset) {
    builder.addFieldOffset(2, creationDateOffset, 0)
  }

  static addAuthorName(builder: flatbuffers.Builder, authorNameOffset: flatbuffers.Offset) {
    builder.addFieldOffset(3, authorNameOffset, 0)
  }

  static addAuthorEmail(builder: flatbuffers.Builder, authorEmailOffset: flatbuffers.Offset) {
    builder.addFieldOffset(4, authorEmailOffset, 0)
  }

  static addOrganization(builder: flatbuffers.Builder, organizationOffset: flatbuffers.Offset) {
    builder.addFieldOffset(5, organizationOffset, 0)
  }

  static addPreprocessorVersion(builder: flatbuffers.Builder, preprocessorVersionOffset: flatbuffers.Offset) {
    builder.addFieldOffset(6, preprocessorVersionOffset, 0)
  }

  static addOriginatingSystem(builder: flatbuffers.Builder, originatingSystemOffset: flatbuffers.Offset) {
    builder.addFieldOffset(7, originatingSystemOffset, 0)
  }

  static addAuthorization(builder: flatbuffers.Builder, authorizationOffset: flatbuffers.Offset) {
    builder.addFieldOffset(8, authorizationOffset, 0)
  }

  static addDescriptions(builder: flatbuffers.Builder, descriptionsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(9, descriptionsOffset, 0)
  }

  static createDescriptionsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset {
    builder.startVector(4, data.length, 4)
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]!)
    }
    return builder.endVector()
  }

  static startDescriptionsVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4)
  }

  static endMetadata(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject()
    builder.requiredField(offset, 6) // schema
    return offset
  }

  static createMetadata(
    builder: flatbuffers.Builder,
    nameOffset: flatbuffers.Offset,
    schemaOffset: flatbuffers.Offset,
    creationDateOffset: flatbuffers.Offset,
    authorNameOffset: flatbuffers.Offset,
    authorEmailOffset: flatbuffers.Offset,
    organizationOffset: flatbuffers.Offset,
    preprocessorVersionOffset: flatbuffers.Offset,
    originatingSystemOffset: flatbuffers.Offset,
    authorizationOffset: flatbuffers.Offset,
    descriptionsOffset: flatbuffers.Offset,
  ): flatbuffers.Offset {
    Metadata.startMetadata(builder)
    Metadata.addName(builder, nameOffset)
    Metadata.addSchema(builder, schemaOffset)
    Metadata.addCreationDate(builder, creationDateOffset)
    Metadata.addAuthorName(builder, authorNameOffset)
    Metadata.addAuthorEmail(builder, authorEmailOffset)
    Metadata.addOrganization(builder, organizationOffset)
    Metadata.addPreprocessorVersion(builder, preprocessorVersionOffset)
    Metadata.addOriginatingSystem(builder, originatingSystemOffset)
    Metadata.addAuthorization(builder, authorizationOffset)
    Metadata.addDescriptions(builder, descriptionsOffset)
    return Metadata.endMetadata(builder)
  }
}
