import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /** Fire-and-forget — never block the request on logging. */
  log(userId: string, eventType: string, metadata?: Record<string, unknown>) {
    this.prisma.learningEvent
      .create({
        data: {
          userId,
          eventType,
          metadata: metadata as Prisma.InputJsonValue,
        },
      })
      .catch(() => void 0);
  }
}
