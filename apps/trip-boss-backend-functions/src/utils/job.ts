import { Queue } from 'bullmq'
import { Logger } from '@nestjs/common'

export function setupJobScheduler(
  queue: Queue,
  jobName: string,
  jobConfig: { every: number | undefined, cron: string | undefined },
  logger: Logger,
): void {
  const jobSchedule: { every: number | undefined, pattern: string | undefined } = {
    every: undefined,
    pattern: undefined,
  }

  if (jobConfig.cron) {
    jobSchedule.pattern = jobConfig.cron
  }
  else if (jobConfig.every) {
    jobSchedule.every = jobConfig.every
  }

  if (jobSchedule.every || jobSchedule.pattern) {
    logger.debug({ message: 'Setting up repeatable job', jobName, ...jobSchedule })
    void queue.upsertJobScheduler(jobName, jobSchedule)
  }
}
