import { v4 as uuidv4 } from 'uuid'
import * as WebIfc from 'web-ifc'

import { Group } from './graphics'
import { Metadata } from './metadata'
import { Model } from './model'
import { WebIfcMeshesConverter, WebIfcSpatialStructureConverter } from './utils/webIfcConverters'

export class IfcLoader {
  static async load(data: Uint8Array, excludedEntityTypes?: Set<number>, includedEntityTypes?: Set<number>, webIfcLoaderSettings?: WebIfc.LoaderSettings): Promise<Model> {
    const webIfcApi = await this.initializeWebIfcApi()
    webIfcApi.OpenModel(data, webIfcLoaderSettings)

    let [entityInstances01, rootExpressId] = await WebIfcSpatialStructureConverter.convert(webIfcApi)

    const expressIds = this.getExpressIds(webIfcApi, excludedEntityTypes, includedEntityTypes)
    const [instancedMeshes, entityInstances02] = WebIfcMeshesConverter.convertToInstancedMeshes(webIfcApi, expressIds, entityInstances01)

    // set parent express id value in entity instances
    for (const entityInstance of entityInstances02.values())
      for (const childExpressId of entityInstance.childrenExpressIds) {
        const childEntityInstance = entityInstances02.get(childExpressId)
        if (!childEntityInstance) throw new Error(`Child entity instance with the express id ${childExpressId} could not be found`)
        childEntityInstance.parentExpressId = entityInstance.expressId
        entityInstances02.set(childExpressId, childEntityInstance)
      }

    const modelId = uuidv4()
    const group = new Group(modelId, instancedMeshes)
    const metadata = new Metadata(webIfcApi)

    return new Model(modelId, group, rootExpressId, entityInstances02, metadata)
  }

  private static async initializeWebIfcApi(): Promise<WebIfc.IfcAPI> {
    const webIfcApi = new WebIfc.IfcAPI()
    webIfcApi.SetWasmPath('https://unpkg.com/web-ifc@0.0.74/', true)
    // webIfcApi.SetWasmPath('')
    await webIfcApi.Init()
    webIfcApi.SetLogLevel(WebIfc.LogLevel.LOG_LEVEL_OFF)

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
