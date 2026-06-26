import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { ExercisesModule } from '../exercises/exercises.module';
import { StorageModule } from '../storage/storage.module';
import { ReviewModule } from '../review/review.module';
import { AdaptiveModule } from '../adaptive/adaptive.module';

@Module({
  imports: [ExercisesModule, StorageModule, ReviewModule, AdaptiveModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
