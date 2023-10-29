import { AddressInfo } from 'net'
import { createServer } from 'http'

import config from './config'
import { app } from './webApp'
import { attachWSToServer } from 'app/wss/attachToServer'
import 'app/backgroundTasks'

export const server = createServer(app)
attachWSToServer(server)

server.listen(config.port, '0.0.0.0', () => {
  const address = server.address() as AddressInfo
  console.log(
    `[server]: Server is running at http://${address.address}:${address.port}`,
  )
})
