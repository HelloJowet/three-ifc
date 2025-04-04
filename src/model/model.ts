import * as WebIfc from 'web-ifc'
import * as THREE from 'three'

import { Metadata } from './metadata'
import { Group } from './group'
import { DecompositionTreeNode } from './decompositionTreeNode'

export class Model {
  webIfcApi: WebIfc.IfcAPI
  private group: Group

  constructor(webIfcApi: WebIfc.IfcAPI, group: Group) {
    this.webIfcApi = webIfcApi
    this.group = group
  }

  static async load(
    data: Uint8Array,
    // List of categories that won't be converted to meshes.
    excludedEntityTypes: Set<number> = new Set<number>([WebIfc.IFCOPENINGELEMENT]),
    // Exclusive list of categories that will be converted to fragments.
    includedEntityTypes?: Set<number>,
    webIfcLoaderSettings?: WebIfc.LoaderSettings
  ): Promise<Model> {
    // initialize and configure a web ifc api instance
    const webIfcApi = new WebIfc.IfcAPI()
    // webIfcApi.SetWasmPath('')
    webIfcApi.SetWasmPath('https://unpkg.com/web-ifc@0.0.68/', true)
    await webIfcApi.Init()
    webIfcApi.SetLogLevel(WebIfc.LogLevel.LOG_LEVEL_WARN)

    webIfcApi.OpenModel(data, webIfcLoaderSettings)

    const group = new Group(webIfcApi, excludedEntityTypes, includedEntityTypes)

    return new Model(webIfcApi, group)
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.group.threeJsInstance)
  }

  getMetadata(): Metadata {
    return new Metadata(this.webIfcApi)
  }

  async getDecompositionTree(): Promise<DecompositionTreeNode> {
    const spatialStructure = await this.webIfcApi.properties.getSpatialStructure(0, true)
    return DecompositionTreeNode.fromWebIfcNode(spatialStructure)
  }
}
