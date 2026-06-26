import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type AnalysisKind = 'WRITING' | 'SPEAKING';
export type JobStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

export interface Job<T = unknown> {
  id: string;
  userId: string;
  kind: AnalysisKind;
  status: JobStatus;
  result?: T;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Approach 7 — in-memory async job queue for slow AI work.
 *
 * The platform's Gemini calls take 15–22s, which is too long to hold a request
 * open. Instead a job is created immediately (PENDING), processed in the
 * background, and the client polls until DONE/FAILED. Purely in-memory: no DB
 * table, no migration, fully additive. Jobs are pruned after a TTL so memory
 * doesn't grow without bound.
 */
@Injectable()
export class JobsService implements OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private readonly jobs = new Map<string, Job>();
  private readonly ttlMs = 30 * 60 * 1000; // keep results for 30 minutes
  private readonly sweep: NodeJS.Timeout;

  constructor() {
    this.sweep = setInterval(() => this.prune(), 5 * 60 * 1000);
    // Don't keep the event loop alive solely for the sweeper.
    this.sweep.unref?.();
  }

  onModuleDestroy() {
    clearInterval(this.sweep);
  }

  /** Create a PENDING job and kick off the worker; returns the job id. */
  start<T>(userId: string, kind: AnalysisKind, work: () => Promise<T>): string {
    const now = Date.now();
    const job: Job<T> = {
      id: randomUUID(),
      userId,
      kind,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(job.id, job as Job);

    // Fire-and-forget; the request returns immediately with the job id.
    void this.run(job.id, work);
    return job.id;
  }

  get(id: string, userId: string): Job | null {
    const job = this.jobs.get(id);
    if (!job || job.userId !== userId) return null;
    return job;
  }

  private async run<T>(id: string, work: () => Promise<T>) {
    const job = this.jobs.get(id);
    if (!job) return;
    job.status = 'RUNNING';
    job.updatedAt = Date.now();
    try {
      const result = await work();
      job.result = result;
      job.status = 'DONE';
    } catch (e) {
      job.error = e instanceof Error ? e.message : String(e);
      job.status = 'FAILED';
      this.logger.error(`Job ${id} (${job.kind}) failed: ${job.error}`);
    } finally {
      job.updatedAt = Date.now();
    }
  }

  private prune() {
    const cutoff = Date.now() - this.ttlMs;
    for (const [id, job] of this.jobs) {
      if (job.updatedAt < cutoff) this.jobs.delete(id);
    }
  }
}
