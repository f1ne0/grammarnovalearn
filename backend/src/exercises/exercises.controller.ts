import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { GenerateExercisesDto } from './dto/generate-exercises.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { TeacherGuard } from '../common/guards/teacher.guard';

@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getExercises(@Query('topicId') topicId: string) {
    if (!topicId) {
      throw new BadRequestException('topicId query parameter is required');
    }
    return this.exercisesService.getExercisesByTopic(topicId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getExerciseById(@Param('id') id: string) {
    // Answer-stripped, validated-only — safe for students.
    return this.exercisesService.getExerciseForPlay(id);
  }

  @Post()
  @UseGuards(JwtGuard, TeacherGuard)
  async createExercise(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.createExercise(createExerciseDto);
  }

  // FEATURE 2: AI generation (pending teacher validation)
  @Post('generate')
  @UseGuards(JwtGuard, TeacherGuard)
  async generateExercises(@Body() dto: GenerateExercisesDto) {
    return this.exercisesService.generateExercises(dto);
  }
}
