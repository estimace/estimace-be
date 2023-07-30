import config from 'app/config'
import { time } from 'app/utils'
import { garbageCollectRooms } from './garbageCollectRooms'
import { acquireBgTaskLock, releaseBgTaskLock } from 'app/models/bgTasks'

scheduleNextDailyRun()

function scheduleNextDailyRun() {
  setTimeout(async () => {
    try {
      const isBgTaskLockAcquiredToGarbageCollectRoom = await acquireBgTaskLock(
        'garbageCollectRooms',
      )
      if (
        config.isGarbageCollectRoomsEnabled &&
        isBgTaskLockAcquiredToGarbageCollectRoom
      ) {
        await garbageCollectRooms(config.roomTimeToLive)
        releaseBgTaskLock('garbageCollectRooms')
      } else {
        return
      }
    } catch (err) {
      console.error(err)
    }

    scheduleNextDailyRun()
  }, time.day)
}
