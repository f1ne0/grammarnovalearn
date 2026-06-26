import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** Append a query param to a connection URL only if it isn't already set. */
function withParam(url: string, key: string, value: string): string {
  if (!url || new RegExp(`[?&]${key}=`).test(url)) return url;
  return url + (url.includes('?') ? '&' : '?') + `${key}=${value}`;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('PrismaService');

  constructor() {
    // Tune the connection pool. Neon is remote, so queries hold connections
    // longer; a larger wait timeout prevents P2024 ("timed out fetching a
    // connection") under bursts, and a modest limit avoids exceeding Neon's
    // own connection cap. Values can still be overridden via DATABASE_URL.
    let url = process.env.DATABASE_URL ?? '';
    // Neon's pooled endpoint (…-pooler…) runs PgBouncer in transaction mode,
    // which doesn't support prepared statements — Prisma needs pgbouncer=true
    // to avoid "prepared statement already exists" errors.
    if (/-pooler\./.test(url)) url = withParam(url, 'pgbouncer', 'true');
    url = withParam(url, 'connection_limit', '10');
    url = withParam(url, 'pool_timeout', '30');
    super(url ? { datasources: { db: { url } } } : {});
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
