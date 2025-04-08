import { test } from 'vitest'

import { IfcLoader } from './ifcLoader'

test('IfcLoader', async () => {
  const response = await fetch('https://thatopen.github.io/engine_components/resources/small.ifc')
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)

  const model = await IfcLoader.load(data)
  // console.log(model.spatialStructure)
})
