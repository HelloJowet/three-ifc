export type ModelId = string
export type ExpressId = number
export type InstancedMeshId = string
export type MeshInstanceId = string
export type ThreeJsInstancedMeshId = number

export interface MeshInstanceReference {
  modelId: ModelId
  instancedMeshId: InstancedMeshId
  instancedMeshInstanceIndex: number
}
