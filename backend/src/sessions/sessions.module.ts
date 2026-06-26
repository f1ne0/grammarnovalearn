import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { ComprehensionModule } from '../comprehension/comprehension.module';

@Module({
  imports: [ComprehensionModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
