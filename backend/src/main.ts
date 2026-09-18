import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `[${timestamp}] [${context ?? 'PRISM'}] ${level}: ${message}`;
          }),
        ),
      }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });

  const configuredOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = configuredOrigin.split(',').map((o) => o.trim());
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  });

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());

  // Ensure both /api/* and /api/v1/* requests resolve seamlessly
  app.use((req: any, _res: any, next: any) => {
    if (
      typeof req.url === 'string' &&
      req.url.startsWith('/api/') &&
      !req.url.startsWith('/api/v1/') &&
      !req.url.startsWith('/api/docs')
    ) {
      req.url = req.url.replace('/api/', '/api/v1/');
    }
    next();
  });

  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PRISM Cadastral Intelligence API')
    .setDescription(
      'API for the PRISM platform: drone imagery, AI feature extraction, parcels, ' +
        'buildings, roads, topology validation, GIS exports and Gemini-powered insights.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PRISM API running on port ${port} | Docs: /api/docs`);
}

bootstrap();
