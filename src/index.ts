import { Model } from './model'
export { Model } from './model'

// async function loadFileFromURL(url: string) {
//   const response = await fetch(url)
//   if (!response.ok) {
//     throw new Error(`Failed to fetch file: ${response.statusText}`)
//   }

//   const arrayBuffer = await response.arrayBuffer()
//   const buffer = new Uint8Array(arrayBuffer)

//   return buffer
// }

// ;(async () => {
//   const fileURL = 'https://thatopen.github.io/engine_components/resources/small.ifc'
//   const buffer = await loadFileFromURL(fileURL)

//   const model = await Model.load(buffer)
//   const modelMetadata = model.getMetadata()

//   const decompositionTree = await model.getDecompositionTree()
//   console.log(decompositionTree)
// })()
