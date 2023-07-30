import { getRoomLastUpdatedBeforeThreshold, deleteRoom } from 'app/models/rooms'
import { destroyConnection } from 'app/wss'

export async function garbageCollectRooms(TTLms: number): Promise<void> {
  const threshold = Date.now() - TTLms

  try {
    let item: Awaited<ReturnType<typeof getRoomLastUpdatedBeforeThreshold>>
    do {
      item = await getRoomLastUpdatedBeforeThreshold(threshold)
      if (item?.roomId) {
        await destroyConnection(item.playersIds)
        await deleteRoom(item.roomId)
      }
    } while (item !== null)
  } catch (err) {
    console.error('garbage collecting rooms was not successful', err)
  }
}
