import fs from 'fs-extra'
import path from 'path'

export async function buildWorlds(buildDir) {
  const worldsDir = path.join(process.cwd(), 'worlds')
  const worldsBuildDir = path.join(buildDir, 'worlds')
  
  // Ensure worlds build directory exists
  await fs.ensureDir(worldsBuildDir)
  
  // Copy worlds to build directory
  await fs.copy(worldsDir, worldsBuildDir, {
    filter: (src) => {
      // Only copy .js files and assets directory
      return src.endsWith('.js') || src.includes('/assets/') || fs.statSync(src).isDirectory()
    }
  })
} 