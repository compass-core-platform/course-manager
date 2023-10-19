import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { useContainer } from "class-validator";
import { AppModule } from "./app.module";
import { validationOptions } from "./utils/utils";
import { SWAGGER_CONSTANTS, SWAGGER_TAGS } from "./utils/constants";

async function bootstrap() {
  // Create a NestJS application instance
  const app = await NestFactory.create(AppModule, { cors: true });

  // Enable using the container for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Retrieve the configuration service for environment variables
  const configService = app.get<ConfigService>(ConfigService);

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  // Retrieve the API prefix from the configuration, defaulting to "api" if not set
  const apiPrefix = configService.get<string>("API_PREFIX") || "api";

  // Set the global API prefix for all routes
  app.setGlobalPrefix(apiPrefix);

  // Enable API versioning using URI segment (e.g., /v1/resource)
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Configure global validation using class-validator with options from validationOptions
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // Configure global serialization using class-transformer
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Configure Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header",
      },
      SWAGGER_CONSTANTS.SWAGGER_AUTH_SECURITY_SCHEMA_JWT // Bearer token security scheme name
    )
    .setTitle(SWAGGER_CONSTANTS.TITLE)
    .setDescription(SWAGGER_CONSTANTS.DESCRIPTION)
    .setVersion(SWAGGER_CONSTANTS.VERSION)
    .addTag(SWAGGER_TAGS.DEFAULT) // Add a tag for API grouping

    .build();

  // Create the Swagger document
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  // Setup Swagger UI endpoint for API documentation
  SwaggerModule.setup(SWAGGER_CONSTANTS.PATH, app, swaggerDocument, {
    swaggerOptions: {
      tagsSorter: "alpha", // Sort tags alphabetically
      operationsSorter: "alpha", // Sort operations alphabetically within tags
      docExpansion: "none", // Collapse all documentation sections by default
    },
  });

  // Start the NestJS application, listening on the specified port or defaulting to 4000
  await app.listen(configService.get<number>("APP_PORT") || 4000);
}

// Call the bootstrap function to start the application
void bootstrap();
