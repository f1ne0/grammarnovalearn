import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { UsersService } from './users.service';

class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  fullName?: string;
}
import { JwtGuard } from '../common/guards/jwt.guard';
import { TeacherGuard } from '../common/guards/teacher.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  async getProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.getUserById(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  async updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('mastery')
  @UseGuards(JwtGuard)
  async getMastery(@CurrentUser() user: JwtUser) {
    return this.usersService.getUserMastery(user.sub);
  }

  @Get('students')
  @UseGuards(JwtGuard, TeacherGuard)
  async getStudents() {
    return this.usersService.getAllStudents();
  }
}
