import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const groups = await this.prisma.studyGroup.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        settings: true,
        _count: { select: { students: true } },
      },
    });

    // avg mastery per group (single grouped query)
    const masteryByGroup = await this.prisma.$queryRaw<
      { studyGroupId: string; avg: number }[]
    >`
      SELECT u."studyGroupId", ROUND(AVG(tm."masteryPct")::numeric, 1)::float AS avg
      FROM topic_mastery tm
      JOIN users u ON u.id = tm."userId"
      WHERE u."studyGroupId" IS NOT NULL
      GROUP BY u."studyGroupId";`;
    const avgMap = new Map(masteryByGroup.map((r) => [r.studyGroupId, r.avg]));

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      studentCount: g._count.students,
      avgMastery: avgMap.get(g.id) ?? 0,
      settings: g.settings,
      createdAt: g.createdAt,
    }));
  }

  async create(name: string) {
    const group = await this.prisma.studyGroup.create({
      data: {
        name,
        settings: { create: {} }, // defaults
      },
      include: { settings: true },
    });
    return group;
  }

  async rename(id: string, name: string) {
    await this.ensureExists(id);
    return this.prisma.studyGroup.update({ where: { id }, data: { name } });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.studyGroup.delete({ where: { id } });
    return { id, deleted: true };
  }

  async updateSettings(
    id: string,
    dto: {
      unlockedUnits?: number[];
      weakThreshold?: number;
      atRiskThreshold?: number;
    },
  ) {
    await this.ensureExists(id);
    return this.prisma.groupSettings.upsert({
      where: { groupId: id },
      update: dto,
      create: { groupId: id, ...dto },
    });
  }

  async assignStudents(id: string, studentIds: string[]) {
    await this.ensureExists(id);
    await this.prisma.user.updateMany({
      where: { id: { in: studentIds }, role: 'STUDENT' },
      data: { studyGroupId: id },
    });
    return { assigned: studentIds.length };
  }

  async removeStudent(id: string, studentId: string) {
    await this.prisma.user.update({
      where: { id: studentId },
      data: { studyGroupId: null },
    });
    return { removed: true };
  }

  /** Units unlocked for a given user's group (empty/no group = all units). */
  async unlockedUnitsForUser(userId: string): Promise<number[] | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { studyGroup: { select: { settings: true } } },
    });
    const units = user?.studyGroup?.settings?.unlockedUnits;
    if (!units || units.length === 0) return null; // null = all unlocked
    return units;
  }

  private async ensureExists(id: string) {
    const g = await this.prisma.studyGroup.findUnique({ where: { id } });
    if (!g) throw new NotFoundException(`Group "${id}" not found`);
  }
}
