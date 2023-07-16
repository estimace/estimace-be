import { AddressInfo } from 'net'
import { createServer } from 'http'

import config from './config'
import { app } from './webApp'
import { attachWSToServer } from 'app/wss/attachToServer'

export const server = createServer(app)
attachWSToServer(server)

server.listen(config.port, () => {
  const address = server.address() as AddressInfo
  console.log(`[server]: Server is running at http://localhost:${address.port}`)
})
