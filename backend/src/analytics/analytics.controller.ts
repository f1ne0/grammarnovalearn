import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { TeacherGuard } from '../common/guards/teacher.guard';

/** Parse ?from&to (ISO) with a sensible default of last 30 days. */
function range(from?: string, to?: string): { from: Date; to: Date } {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from
    ? new Date(from)
    : new Date(toDate.getTime() - 30 * 24 * 3600 * 1000);
  return { from: fromDate, to: toDate };
}

@Controller('analytics')
@UseGuards(JwtGuard, TeacherGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  // ===== legacy (kept) =====
  @Get('groups')
  groups() {
    return this.analyticsService.groupComparison();
  }

  @Get('errors')
  errors() {
    return this.analyticsService.errorHeatmap();
  }

  @Get('curve/:userId')
  curve(@Param('userId') userId: string) {
    return this.analyticsService.learningCurve(userId);
  }

  // ===== advanced =====
  @Get('overview')
  overview(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = range(from, to);
    return this.analyticsService.overview(f, t);
  }

  @Get('timeline')
  timeline(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = range(from, to);
    return this.analyticsService.classTimeline(f, t);
  }

  @Get('groups/compare')
  groupsCompare(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = range(from, to);
    return this.analyticsService.groupsCompare(f, t);
  }

  @Get('groups/:groupId')
  groupDetail(
    @Param('groupId') groupId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const { from: f, to: t } = range(from, to);
    return this.analyticsService.groupDetail(groupId, f, t);
  }

  @Get('students/:id/insight')
  studentInsight(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const { from: f, to: t } = range(from, to);
    return this.analyticsService.studentInsight(id, f, t);
  }

  @Get('experiment')
  experiment(@Query('from') from?: string, @Query('to') to?: string) {
    const { from: f, to: t } = range(from, to);
    return this.analyticsService.experiment(f, t);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="submissions.csv"')
  export() {
    return this.analyticsService.exportSubmissionsCsv();
  }
}
