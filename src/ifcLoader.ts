import * as WebIfc from 'web-ifc'

import { Group } from './graphics'
import { Metadata } from './metadata'
import { Model } from './model'
import { WebIfcMeshesConverter, WebIfcSpatialStructureConverter } from './utils/webIfcConverters'

export class IfcLoader {
  static async load(data: Uint8Array, excludedEntityTypes?: Set<number>, includedEntityTypes?: Set<number>, webIfcLoaderSettings?: WebIfc.LoaderSettings): Promise<Model> {
    const webIfcApi = await this.initializeWebIfcApi()
    webIfcApi.OpenModel(data, webIfcLoaderSettings)

    let [spatialStructure, entityInstances01] = await WebIfcSpatialStructureConverter.convert(webIfcApi)

    const expressIds = this.getExpressIds(webIfcApi, excludedEntityTypes, includedEntityTypes)
    const [instancedMeshes, entityInstances02] = WebIfcMeshesConverter.convertToInstancedMeshes(webIfcApi, expressIds, entityInstances01)

    const group = new Group(instancedMeshes)
    const metadata = new Metadata(webIfcApi)

    return new Model(group, entityInstances02, spatialStructure, metadata)
  }

  private static async initializeWebIfcApi(): Promise<WebIfc.IfcAPI> {
    const webIfcApi = new WebIfc.IfcAPI()
    webIfcApi.SetWasmPath('https://unpkg.com/web-ifc@0.0.68/', true)
    // webIfcApi.SetWasmPath('')
    await webIfcApi.Init()
    webIfcApi.SetLogLevel(WebIfc.LogLevel.LOG_LEVEL_WARN)

    return webIfcApi
  }

  // get all express ids that fit in the excludedEntityTypes and includedEntityTypes lists
  private static getExpressIds(webIfcApi: WebIfc.IfcAPI, excludedEntityTypes?: Set<number>, includedEntityTypes?: Set<number>): number[] {
    const entityTypes = webIfcApi.GetIfcEntityList(0)

    const expressIds: number[] = []
    for (const entityType of entityTypes) {
      if (!webIfcApi.IsIfcElement(entityType) && entityType !== WebIfc.IFCSPACE) continue

      if (includedEntityTypes && !includedEntityTypes.has(entityType)) continue
      else if (excludedEntityTypes && excludedEntityTypes.has(entityType)) continue

      const expressIdsOfEntityType = webIfcApi.GetLineIDsWithType(0, entityType)

      for (const expressId of expressIdsOfEntityType) expressIds.push(expressId)
    }

    return expressIds
  }
}
