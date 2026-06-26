import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TestsService } from './tests.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

class TestAnswerDto {
  @IsString()
  exerciseId: string;

  @IsObject()
  answer: Record<string, unknown>;
}

class SubmitTestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestAnswerDto)
  answers: TestAnswerDto[];
}

@Controller('tests')
@UseGuards(JwtGuard)
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Get()
  async list(@CurrentUser() user: JwtUser) {
    return this.testsService.list(user);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.testsService.getById(id);
  }

  @Post(':id/start')
  async start(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.testsService.startAttempt(user.sub, id);
  }

  @Post('attempts/:attemptId/submit')
  async submit(
    @CurrentUser() user: JwtUser,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitTestDto,
  ) {
    return this.testsService.submitAttempt(user.sub, attemptId, dto.answers);
  }
}
