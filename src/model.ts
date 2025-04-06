import * as THREE from 'three'
import * as WebIfc from 'web-ifc'

import { DecompositionTreeNode } from './decompositionTreeNode'
import { Group } from './geometry/group'
import { Metadata } from './metadata'

export class Model {
  webIfcApi: WebIfc.IfcAPI
  group: Group

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
    webIfcLoaderSettings?: WebIfc.LoaderSettings,
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

  getThreeJsInstance(): THREE.Group {
    return this.group.getThreeJsInstance()
  }

  getMetadata(): Metadata {
    return new Metadata(this.webIfcApi)
  }

  async getDecompositionTree(): Promise<DecompositionTreeNode> {
    const spatialStructure = await this.webIfcApi.properties.getSpatialStructure(0, true)
    return DecompositionTreeNode.fromWebIfcNode(spatialStructure)
  }
}
