import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GrammarService } from './grammar.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

class CheckAnswerDto {
  @IsString()
  exerciseId: string;

  @IsObject()
  answer: Record<string, unknown>;
}

class SubmitCheckDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckAnswerDto)
  answers: CheckAnswerDto[];
}

@Controller('grammar')
export class GrammarController {
  constructor(private grammarService: GrammarService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  async library(@CurrentUser() user?: JwtUser) {
    return this.grammarService.library(user?.sub);
  }

  @Get(':slug/drills')
  @UseGuards(JwtGuard)
  async drills(
    @CurrentUser() user: JwtUser,
    @Param('slug') slug: string,
    @Query('n', new DefaultValuePipe(10), ParseIntPipe) n: number,
  ) {
    return this.grammarService.drills(slug, user.sub, n);
  }

  // Approach 5: knowledge check
  @Get(':slug/check')
  @UseGuards(JwtGuard)
  async knowledgeCheck(@Param('slug') slug: string) {
    return this.grammarService.knowledgeCheck(slug);
  }

  @Post(':slug/check')
  @UseGuards(JwtGuard)
  async submitCheck(
    @CurrentUser() user: JwtUser,
    @Param('slug') slug: string,
    @Body() dto: SubmitCheckDto,
  ) {
    return this.grammarService.submitKnowledgeCheck(
      slug,
      user.sub,
      dto.answers,
    );
  }

  @Get(':slug')
  @UseGuards(OptionalJwtGuard)
  async reference(@Param('slug') slug: string, @CurrentUser() user?: JwtUser) {
    return this.grammarService.reference(slug, user?.sub);
  }
}
