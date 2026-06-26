import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import {
  AssignStudentsDto,
  CreateGroupDto,
  GroupSettingsDto,
  RenameGroupDto,
} from './dto/group.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { TeacherGuard } from '../common/guards/teacher.guard';

@Controller('teacher/groups')
@UseGuards(JwtGuard, TeacherGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  list() {
    return this.groupsService.list();
  }

  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto.name);
  }

  @Patch(':id')
  rename(@Param('id') id: string, @Body() dto: RenameGroupDto) {
    return this.groupsService.rename(id, dto.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Patch(':id/settings')
  settings(@Param('id') id: string, @Body() dto: GroupSettingsDto) {
    return this.groupsService.updateSettings(id, dto);
  }

  @Post(':id/students')
  assign(@Param('id') id: string, @Body() dto: AssignStudentsDto) {
    return this.groupsService.assignStudents(id, dto.studentIds);
  }

  @Delete(':id/students/:sid')
  removeStudent(@Param('id') id: string, @Param('sid') sid: string) {
    return this.groupsService.removeStudent(id, sid);
  }
}
