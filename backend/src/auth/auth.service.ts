import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { InvitesService } from '../invites/invites.service';

interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  type?: 'access' | 'refresh';
}

/** Refresh tokens are stored as a hash, never in plaintext. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private invitesService: InvitesService,
  ) {}

  // ===== REGISTER =====
  async register(registerDto: RegisterDto) {
    const { email, password, inviteCode, fullName, consent } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const isValidInvite =
      await this.invitesService.validateInviteCode(inviteCode);
    if (!isValidInvite) {
      throw new BadRequestException('Invalid or expired invite code');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Round-robin experiment arm assignment (teacher can override later)
    const studentCount = await this.prisma.user.count({
      where: { role: 'STUDENT' },
    });
    const experimentArm = studentCount % 2 === 0 ? 'CONTROL' : 'EXPERIMENTAL';

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        experimentArm,
        fullName,
        consentGivenAt: consent ? new Date() : null,
      },
    });

    // Claim the invite atomically; if another registration won the race, roll back.
    const claimed = await this.invitesService.claimInviteCode(
      inviteCode,
      user.id,
    );
    if (!claimed) {
      await this.prisma.user.delete({ where: { id: user.id } });
      throw new BadRequestException('Invite code was already used');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  // ===== LOGIN =====
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  // ===== REFRESH TOKEN =====
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Reject access tokens used as refresh tokens.
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: hashToken(refreshToken) },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Rotate: delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      return this.generateTokens(decoded.sub, decoded.email, decoded.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ===== HELPER: GENERATE TOKENS =====
  private async generateTokens(userId: string, email: string, role = 'STUDENT') {
    const expiresIn = (this.configService.get<string>('JWT_EXPIRY') ||
      '24h') as SignOptions['expiresIn'];
    const refreshTokenExpiresIn = (this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRY',
    ) || '7d') as SignOptions['expiresIn'];

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role, type: 'access' },
      { expiresIn },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email, role, type: 'refresh' },
      { expiresIn: refreshTokenExpiresIn },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store only the hash — a DB leak must not yield usable tokens.
    await this.prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  // ===== GET CURRENT USER =====
  async getCurrentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        experimentArm: true,
        studyGroupId: true,
        fullName: true,
        consentGivenAt: true,
        createdAt: true,
      },
    });
  }

  // ===== LOGOUT (invalidate refresh token) =====
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: hashToken(refreshToken) },
      });
    } else {
      // No token provided — invalidate all sessions of this user
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    return { success: true };
  }

  // ===== CHANGE PASSWORD =====
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
    // Invalidate all refresh tokens after password change
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  // ===== CONSENT (give / withdraw) =====
  async setConsent(userId: string, consent: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { consentGivenAt: consent ? new Date() : null },
      select: { id: true, consentGivenAt: true },
    });
  }
}
