import {
  ClassSerializerInterceptor,
  INestApplication,
  VersioningType,
} from "@nestjs/common"
import { NestFactory, Reflector } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { useContainer } from "class-validator"
import { configDotenv } from "dotenv"
import { initializeTransactionalContext } from "typeorm-transactional"
import { AppModule } from "./app.module"
import { ApiInterceptor, ApiPipe } from "./shared/api"
import { logger } from "./shared/utils/logger"

configDotenv()

function setupSwagger(app: INestApplication<any>, prefix = "docs") {
  const config = new DocumentBuilder()
    .setTitle("Document API")
    .setDescription("The summary document api")
    .setVersion("1.0")
    .addBearerAuth({ type: "apiKey", in: "header", name: "Authorization" })
    .build()

  const document = SwaggerModule.createDocument(app, config)

  logger.info(
    "Swagger running at: " +
      `http://localhost:${process.env.APP_PORT}/${prefix}`,
  )

  SwaggerModule.setup(prefix, app, document)
}

async function setupServer(app: INestApplication<any>, prefix: string) {
  await app.listen(process.env.APP_PORT || 8000)

  logger.info(
    "Server running at port: " +
      `http://localhost:${process.env.APP_PORT}/${prefix}`,
  )
}

async function setupPlugins(app: INestApplication<any>) {
  // CORS Configuration
  app.enableCors({
    origin: process.env.APP_CORS.split(",").map((i) => i.trim()),
  })

  // App versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  })

  app.useGlobalInterceptors(
    new ApiInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  )

  app.useGlobalPipes(ApiPipe.create())
}

async function bootstrap() {
  initializeTransactionalContext()

  const appPrefix = process.env.APP_PREFIX || "/"

  const app = await NestFactory.create(AppModule, { cors: true })

  app.setGlobalPrefix(appPrefix)

  setupPlugins(app)
  setupSwagger(app)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  setupServer(app, appPrefix)
}
bootstrap()
