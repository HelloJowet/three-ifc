import * as WebIfc from 'web-ifc'

import { EntityInstance } from '../../entityInstance'
import { ExpressId } from '../../types'

export class WebIfcSpatialStructureConverter {
  static async convert(webIfcApi: WebIfc.IfcAPI): Promise<[Map<ExpressId, EntityInstance>, ExpressId]> {
    const webIfcSpatialStructure = await webIfcApi.properties.getSpatialStructure(0, true)
    const entityInstances = WebIfcSpatialStructureConverter.convertWebIfcNode(webIfcSpatialStructure, new Map())
    const rootExpressId = webIfcSpatialStructure.expressID

    return [entityInstances, rootExpressId]
  }

  private static convertWebIfcNode(webIfcNode: any, entityInstances: Map<ExpressId, EntityInstance>): Map<ExpressId, EntityInstance> {
    const entityInstance = new EntityInstance(webIfcNode.expressID, webIfcNode.type, new Map(), new Set())

    const propertyKeys = Object.keys(webIfcNode).filter((item) => !['expressID', 'type', 'children'].includes(item))
    for (const propertyKey of propertyKeys) {
      const propertyValue = webIfcNode[propertyKey]
      if (propertyValue) entityInstance.properties.set(propertyKey, propertyValue.value)
    }

    for (const webIfcNodeChild of webIfcNode.children) {
      WebIfcSpatialStructureConverter.convertWebIfcNode(webIfcNodeChild, entityInstances)
      entityInstance.childrenExpressIds.add(webIfcNodeChild.expressID)
    }

    entityInstances.set(webIfcNode.expressID, entityInstance)

    return entityInstances
  }
}
