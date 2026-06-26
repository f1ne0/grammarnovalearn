import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Generate an invite code
  async generateInviteCode(teacherId: string): Promise<string> {
    const length = this.configService.get<number>('INVITE_CODE_LENGTH') || 8;
    const code = randomBytes(length)
      .toString('base64url')
      .replace(/[^A-Z0-9]/gi, '')
      .substring(0, length)
      .toUpperCase()
      .padEnd(length, 'X');

    const expiryDays =
      this.configService.get<number>('INVITE_EXPIRY_DAYS') || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const invite = await this.prisma.invite.create({
      data: {
        code,
        createdBy: teacherId,
        expiresAt,
      },
    });

    return invite.code;
  }

  // Validate an invite code
  async validateInviteCode(code: string): Promise<boolean> {
    const invite = await this.prisma.invite.findUnique({
      where: { code },
    });

    if (!invite) {
      return false;
    }

    if (invite.usedBy) {
      return false;
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /** Atomically claim a code: succeeds for exactly one concurrent caller. */
  async claimInviteCode(code: string, userId: string): Promise<boolean> {
    const res = await this.prisma.invite.updateMany({
      where: {
        code,
        usedBy: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      data: { usedBy: userId },
    });
    return res.count === 1;
  }

  // All codes of a teacher
  async getTeacherInvites(teacherId: string) {
    return this.prisma.invite.findMany({
      where: { createdBy: teacherId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
