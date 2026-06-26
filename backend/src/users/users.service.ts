import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        experimentArm: true,
        studyGroupId: true,
        fullName: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(id: string, dto: { fullName?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: { fullName: dto.fullName },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        experimentArm: true,
      },
    });
  }

  async getAllStudents() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getUserMastery(userId: string) {
    return this.prisma.topicMastery.findMany({
      where: { userId },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            slug: true,
            unit: true,
          },
        },
      },
    });
  }
}
