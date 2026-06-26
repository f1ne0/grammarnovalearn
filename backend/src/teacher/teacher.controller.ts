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
import { TeacherService } from './teacher.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SetGroupDto } from './dto/set-group.dto';
import { ValidateExerciseDto } from './dto/validate-exercise.dto';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { GenerateTestDto } from './dto/generate-test.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { TeacherGuard } from '../common/guards/teacher.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('teacher')
@UseGuards(JwtGuard, TeacherGuard)
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  @Get('students')
  async getStudents() {
    return this.teacherService.getStudents();
  }

  @Get('students/:studentId')
  async getStudentDetails(@Param('studentId') studentId: string) {
    return this.teacherService.getStudentDetails(studentId);
  }

  @Get('heatmap')
  async getHeatmap() {
    return this.teacherService.getHeatmap();
  }

  @Post('assignments')
  async createAssignment(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.teacherService.createAssignment(user.sub, dto);
  }

  @Get('assignments')
  async getAssignments(@CurrentUser() user: JwtUser) {
    return this.teacherService.getAssignments(user.sub);
  }

  @Patch('students/:studentId/group')
  async setGroup(
    @Param('studentId') studentId: string,
    @Body() dto: SetGroupDto,
  ) {
    return this.teacherService.setGroup(studentId, dto.group);
  }

  @Get('exercises/pending')
  async pendingExercises() {
    return this.teacherService.pendingExercises();
  }

  @Patch('exercises/:id/validate')
  async validateExercise(
    @Param('id') id: string,
    @Body() dto: ValidateExerciseDto,
  ) {
    return this.teacherService.validateExercise(id, dto.approve);
  }

  @Post('tests')
  async createTest(@Body() dto: CreateTestDto) {
    return this.teacherService.createTest(dto);
  }

  @Post('tests/generate')
  async generateTest(@Body() dto: GenerateTestDto) {
    return this.teacherService.generateTest(dto);
  }

  @Patch('tests/:id')
  async updateTest(@Param('id') id: string, @Body() dto: UpdateTestDto) {
    return this.teacherService.updateTest(id, dto);
  }

  @Delete('tests/:id')
  async deleteTest(@Param('id') id: string) {
    return this.teacherService.deleteTest(id);
  }
}
