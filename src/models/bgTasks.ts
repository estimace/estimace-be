import { db } from 'app/db'
import { BgTasks } from './types'

export async function acquireBgTaskLock(
  taskName: BgTasks['name'],
): Promise<boolean> {
  let lockAcquired = false

  await db.transaction(async function (trx) {
    try {
      const tasks = await db('bgTasks')
        .select(['isLocked'])
        .where({ name: taskName })

      if (tasks.length === 0) {
        await db('bgTasks').insert({
          name: taskName,
          isLocked: true,
          createdAt: new Date(),
        })
        lockAcquired = true
      } else if (!tasks[0].isLocked) {
        await db('bgTasks').update({ isLocked: true }).where({ name: taskName })
        lockAcquired = true
      }

      await trx.commit()
    } catch (_) {
      trx.rollback()
    }
  })

  return lockAcquired
}

export async function releaseBgTaskLock(
  taskName: BgTasks['name'],
): Promise<boolean> {
  const rowsEffected = await db('bgTasks')
    .update({ isLocked: false })
    .where({ name: taskName, isLocked: true })
  return rowsEffected > 0
}
