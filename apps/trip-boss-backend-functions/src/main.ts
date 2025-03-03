import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Logger, LoggerErrorInterceptor, PinoLogger } from 'nestjs-pino'
import pino from 'pino'
import { PinoConfig } from './app.config'
import { AppHost, AppModule } from './app.module'
import { initializeMicroservices } from './infrastructure/microservices/initializer'

const logger = pino(PinoConfig)
console.log = logger.info.bind(logger)
console.error = logger.error.bind(logger)
console.warn = logger.warn.bind(logger)

export async function bootstrap() {
  const loggerService = new Logger(new PinoLogger({ pinoHttp: PinoConfig }), {})

  const fastifyAdapter = new FastifyAdapter({ logger: false })

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    logger: loggerService,
  })

  app.useLogger(loggerService)
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  app.select(AppModule).get(AppHost).app = app
  await app.init()
  initializeMicroservices(app)

  await app.startAllMicroservices()
  app.enableShutdownHooks()

  const port = process.env.PORT || 3035
  logger.info(`Starting... PORT: ${port}`)
  await app.listen(port, '0.0.0.0')
}

bootstrap().catch(err => {
  console.error(err)
  process.exit(1)
})
