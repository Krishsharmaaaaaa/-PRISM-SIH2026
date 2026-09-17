import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ImageryModule } from './modules/imagery/imagery.module';
import { GisModule } from './modules/gis/gis.module';
import { TopologyModule } from './modules/topology/topology.module';
import { AiModule } from './modules/ai/ai.module';
import { GeocodingModule } from './modules/geocoding/geocoding.module';
import { ExportsModule } from './modules/exports/exports.module';
import { ProcessingJobsModule } from './modules/processing-jobs/processing-jobs.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongoUri'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>('throttle.ttl') ?? 60) * 1000,
            limit: config.get<number>('throttle.limit') ?? 100,
          },
        ],
      }),
    }),

    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    ImageryModule,
    GisModule,
    TopologyModule,
    AiModule,
    GeocodingModule,
    ExportsModule,
    ProcessingJobsModule,
    AuditLogsModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  providers: [
    // Every route requires a valid JWT unless explicitly marked @Public().
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
      inject: [Reflector],
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
