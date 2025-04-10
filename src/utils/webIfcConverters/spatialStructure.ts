import * as WebIfc from 'web-ifc'

import { EntityInstance } from '../../entityInstance'
import { SpatialStructure, SpatialStructureNode } from '../../spatialStructure'
import { ExpressId } from '../../types'

export class WebIfcSpatialStructureConverter {
  static async convert(webIfcApi: WebIfc.IfcAPI): Promise<[SpatialStructure, Map<ExpressId, EntityInstance>]> {
    const webIfcSpatialStructure = await webIfcApi.properties.getSpatialStructure(0, true)
    const [spatialStructureNode, entityInstances] = WebIfcSpatialStructureConverter.convertWebIfcNode(webIfcSpatialStructure, new Map())
    const spatialStructure = new SpatialStructure(spatialStructureNode)

    return [spatialStructure, entityInstances]
  }

  private static convertWebIfcNode(webIfcNode: any, entityInstances: Map<ExpressId, EntityInstance>): [SpatialStructureNode, Map<ExpressId, EntityInstance>] {
    const propertyKeys = Object.keys(webIfcNode).filter((item) => !['expressID', 'type', 'children'].includes(item))
    const properties: Map<string, any> = new Map()
    for (const propertyKey of propertyKeys) {
      const propertyValue = webIfcNode[propertyKey]
      if (propertyValue) properties.set(propertyKey, propertyValue.value)
    }
    entityInstances.set(webIfcNode.expressID, new EntityInstance(webIfcNode.expressID, webIfcNode.type, properties))

    const spatialStructureNodeChildren: Set<SpatialStructureNode> = new Set()
    for (const webIfcNodeChild of webIfcNode.children) {
      const [childSpatialStructureNode, childEntityInstances] = WebIfcSpatialStructureConverter.convertWebIfcNode(webIfcNodeChild, entityInstances)
      entityInstances = new Map([...entityInstances, ...childEntityInstances])
      spatialStructureNodeChildren.add(childSpatialStructureNode)
    }
    const spatialStructureNode = new SpatialStructureNode(webIfcNode.expressID, spatialStructureNodeChildren)

    return [spatialStructureNode, entityInstances]
  }
}
