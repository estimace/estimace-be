import { WSChain } from 'superwstest'

export const assertNotReceivedAnyMessage = async (wsChain: WSChain) => {
  const messagesReceived: any = []
  ;(await wsChain).on('message', (data) => {
    messagesReceived.push(data)
  })
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (messagesReceived.length > 0) {
        reject(`WS received ${messagesReceived.length} message(s)`)
      } else {
        resolve(true)
      }
    }, 100)
  })
}
