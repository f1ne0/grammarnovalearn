import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MeService } from './me.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('me')
@UseGuards(JwtGuard)
export class MeController {
  constructor(private meService: MeService) {}

  @Get('progress')
  async progress(@CurrentUser() user: JwtUser) {
    return this.meService.progress(user.sub);
  }

  @Get('activity')
  async activity(@CurrentUser() user: JwtUser) {
    return this.meService.activity(user.sub);
  }

  @Get('submissions')
  async submissions(
    @CurrentUser() user: JwtUser,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.meService.submissions(user.sub, limit, offset);
  }

  @Get('reviews')
  async reviews(@CurrentUser() user: JwtUser) {
    return this.meService.reviews(user.sub);
  }

  @Get('writing')
  async writing(@CurrentUser() user: JwtUser) {
    return this.meService.writingHistory(user.sub);
  }

  @Get('speaking')
  async speaking(@CurrentUser() user: JwtUser) {
    return this.meService.speakingHistory(user.sub);
  }
}
