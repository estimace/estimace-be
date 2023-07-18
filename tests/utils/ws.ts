import { WSChain } from 'superwstest'
import { restoreTimeMock } from './index'

export const assertNotReceivedAnyMessage = async (
  wsChain: WSChain,
): Promise<void> => {
  restoreTimeMock()
  const messagesReceived: any = []
  ;(await wsChain).on('message', (data) => {
    messagesReceived.push(data)
  })
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (messagesReceived.length > 0) {
        reject(new Error(`WS received ${messagesReceived.length} message(s)`))
      } else {
        resolve()
      }
    }, 100)
  })
}
