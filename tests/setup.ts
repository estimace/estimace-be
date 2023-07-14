import 'tsconfig-paths/register'
import { db } from 'app/db'

async function setup() {
  console.log('\n👷 Setting up the test database...')
  await db.migrate.latest({ loadExtensions: ['.ts'] })
  console.log('🏭 Test database is ready.\n')
}

export default setup
