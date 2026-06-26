import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config/env';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitesModule } from './invites/invites.module';
import { TopicsModule } from './topics/topics.module';
import { ExercisesModule } from './exercises/exercises.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { TtsModule } from './tts/tts.module';
import { TeacherModule } from './teacher/teacher.module';
import { ReviewModule } from './review/review.module';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { AdaptiveModule } from './adaptive/adaptive.module';
import { WritingModule } from './writing/writing.module';
import { SessionsModule } from './sessions/sessions.module';
import { TestsModule } from './tests/tests.module';
import { MeModule } from './me/me.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GroupsModule } from './groups/groups.module';
import { GrammarModule } from './grammar/grammar.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting: 120 req/min default; AI endpoints use @Throttle overrides
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AiModule,
    EventsModule,
    StorageModule,
    AuthModule,
    UsersModule,
    InvitesModule,
    TopicsModule,
    ExercisesModule,
    SubmissionsModule,
    TtsModule,
    TeacherModule,
    ReviewModule,
    AdaptiveModule,
    WritingModule,
    SessionsModule,
    TestsModule,
    MeModule,
    AnalyticsModule,
    GroupsModule,
    GrammarModule,
    HealthModule,
    AnalysisModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
