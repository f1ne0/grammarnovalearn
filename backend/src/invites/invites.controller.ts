import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { TeacherGuard } from '../common/guards/teacher.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post('generate')
  @UseGuards(JwtGuard, TeacherGuard)
  async generateInvite(@CurrentUser() user: JwtUser) {
    const code = await this.invitesService.generateInviteCode(user.sub);
    return { code };
  }

  @Get()
  @UseGuards(JwtGuard, TeacherGuard)
  async getInvites(@CurrentUser() user: JwtUser) {
    return this.invitesService.getTeacherInvites(user.sub);
  }
}
