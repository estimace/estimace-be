import { promisify } from 'node:util'
import { exec } from 'child_process'

const execp = promisify(exec)

async function setup() {
  console.log('\n👷 Setting up the test database...')
  const { stdout, stderr } = await execp('yarn db:migrate:latest')

  if (stderr) {
    process.stderr.write(stderr)
    process.exit(1)
  }

  process.stdout.write(stdout)
  console.log('🏭 Test database is ready.\n')
}

export default setup
