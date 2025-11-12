import fs from 'fs-extra'

async function main() {
  const exists = await fs.pathExists('package.json')
  console.log('fs-extra pathExists package.json', exists)
}

main()
