export class DecompositionTreeNode {
  expressId: number
  type: string
  properties: { [key: string]: any }
  children: DecompositionTreeNode[]

  constructor(expressId: number, type: string, properties: { [key: string]: any }, children: DecompositionTreeNode[]) {
    this.expressId = expressId
    this.type = type
    this.properties = properties
    this.children = children
  }

  static fromWebIfcNode(webIfcNode: any): DecompositionTreeNode {
    const propertyKeys = Object.keys(webIfcNode).filter((item) => !['expressID', 'type', 'children'].includes(item))
    const properties: { [key: string]: any } = {}
    for (const propertyKey of propertyKeys) {
      const propertyValue = webIfcNode[propertyKey]
      properties[propertyKey] = propertyValue
    }

    return new DecompositionTreeNode(
      webIfcNode.expressID,
      webIfcNode.type,
      properties,
      webIfcNode.children.map((child: any) => DecompositionTreeNode.fromWebIfcNode(child)),
    )
  }
}
