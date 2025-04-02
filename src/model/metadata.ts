import * as WebIfc from 'web-ifc'

export class Metadata {
  name: string | undefined
  schema: string
  creationDate: Date | undefined
  authorName: string | undefined
  authorEmail: string | undefined
  organization: string | undefined
  preprocessorVersion: string | undefined
  originatingSystem: string | undefined
  authorization: string | undefined
  descriptions: Record<string, any> = {}

  constructor(webIfcApi: WebIfc.IfcAPI) {
    const { arguments: fileNameArguments } = webIfcApi.GetHeaderLine(0, WebIfc.FILE_NAME) || {}
    if (fileNameArguments) {
      const [name, timestamp, author, organization, preprocessorVersion, originatingSystem, authorization] = fileNameArguments

      if (name?.value) this.name = name.value
      if (timestamp?.value) this.creationDate = new Date(timestamp.value)
      if (author) {
        const [authorName, authorEmail] = author
        if (authorName?.value) this.authorName = authorName.value
        if (authorEmail?.value) this.authorEmail = authorEmail.value
      }
      if (organization && organization[0]?.value) this.organization = organization[0].value
      if (preprocessorVersion?.value) this.preprocessorVersion = preprocessorVersion?.value
      if (originatingSystem?.value) this.originatingSystem = originatingSystem?.value
      if (authorization?.value) this.authorization = authorization?.value
    }

    const { arguments: fileDescriptionArguments } = webIfcApi.GetHeaderLine(0, WebIfc.FILE_DESCRIPTION) || {}
    if (fileDescriptionArguments) {
      const [description, implementationLevel] = fileDescriptionArguments
      if (Array.isArray(description) && description[0]?.value) {
        const viewDefinition = description[0].value.match(/\[([^\]]+)\]/)
        if (viewDefinition && viewDefinition[1]) this.descriptions.viewDefinition = viewDefinition[1]
      }
      if (implementationLevel?.value) this.descriptions.implementationLevel = implementationLevel.value
    }

    this.schema = webIfcApi.GetModelSchema(0)
  }
}
