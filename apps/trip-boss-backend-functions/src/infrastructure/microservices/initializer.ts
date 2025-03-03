import { INestApplication } from '@nestjs/common'
import { Logger } from '@nestjs/common'

const microservicesRegistrationList: any[] = []
let app: INestApplication | undefined

export const Microservices: Record<string, any> = {}

export const registerMicroservice = ({ name, microserviceOptions }: { name: string, microserviceOptions: any }) => {
  microservicesRegistrationList.push({ name, microserviceOptions })
}

export const initializeMicroservices = (app: INestApplication) => {
  if (app) {
    console.log(`Initializing microservices... ${microservicesRegistrationList.length}`)
    microservicesRegistrationList.forEach(microserviceItem => {
      const ms = app.connectMicroservice(microserviceItem.microserviceOptions)
      Microservices[microserviceItem.name] = ms

      Logger.debug(`Microservice ${microserviceItem.name} connected.`)
    })
  }
}
