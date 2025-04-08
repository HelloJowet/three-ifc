import { ExpressId } from '../types'

export class SpatialStructureNode {
  expressId: ExpressId
  children: Set<SpatialStructureNode>

  constructor(expressId: ExpressId, children: Set<SpatialStructureNode>) {
    this.expressId = expressId
    this.children = children
  }
}
