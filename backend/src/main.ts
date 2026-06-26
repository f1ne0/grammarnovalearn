import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { json, urlencoded } from "express";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      // Allow <audio>/<img> on the frontend origin to load API resources
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  // Swagger at /docs — disabled in production (don't disclose the API surface).
  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("GrammarNovaLearn API")
      .setDescription("AI English Learning Platform — backend API")
      .setVersion("2.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document);
  }

  // Render (and most PaaS) inject PORT; bind 0.0.0.0 so the platform can reach us.
  const port = process.env.PORT || process.env.API_PORT || 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`🚀 Server running on port ${port}`);
}

void bootstrap();
