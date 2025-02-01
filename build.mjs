import 'dotenv-flow/config'
import fs from 'fs-extra'
import path from 'path'
import { fork } from 'child_process'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import { buildWorlds } from './build.worlds.mjs'

const dev = process.argv.includes('--dev')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(dirname, './')
const buildDir = path.join(rootDir, 'build')

await fs.emptyDir(buildDir)

// Build worlds
await buildWorlds(buildDir)

/**
 * Build Client
 */

const clientPublicDir = path.join(rootDir, 'src/client/public')
const clientBuildDir = path.join(rootDir, 'build/public')
const clientHtmlSrc = path.join(rootDir, 'src/client/public/index.html')
const clientHtmlDest = path.join(rootDir, 'build/public/index.html')

{
  // get all public app env variables
  const publicEnvs = {}
  for (const key in process.env) {
    if (key.startsWith('PUBLIC_')) {
      const value = process.env[key]
      publicEnvs[`process.env.${key}`] = JSON.stringify(value)
    }
  }
  const clientCtx = await esbuild.context({
    entryPoints: ['src/client/index.js'],
    entryNames: '/[name]-[hash]',
    outdir: clientBuildDir,
    platform: 'browser',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    minify: false,
    sourcemap: true,
    metafile: true,
    jsx: 'automatic',
    jsxImportSource: '@firebolt-dev/jsx',
    define: {
      // 'process.env.NODE_ENV': '"development"',
      'process.env.CLIENT': 'true',
      'process.env.SERVER': 'false',
      ...publicEnvs,
    },
    loader: {
      '.js': 'jsx',
    },
    alias: {
      react: 'react', // always use our own local react (jsx)
    },
    plugins: [
      {
        name: 'client-finalize-plugin',
        setup(build) {
          build.onEnd(async result => {
            // copy over public files
            await fs.copy(clientPublicDir, clientBuildDir)
            // find js output file
            const metafile = result.metafile
            const outputFiles = Object.keys(metafile.outputs)
            const jsFile = outputFiles.find(file => file.endsWith('.js')).split('build/public')[1]
            // inject into html and copy over
            let htmlContent = await fs.readFile(clientHtmlSrc, 'utf-8')
            htmlContent = htmlContent.replace('{jsFile}', jsFile)
            htmlContent = htmlContent.replace('{timestamp}', Date.now())
            await fs.writeFile(clientHtmlDest, htmlContent)
          })
        },
      },
    ],
  })
  if (dev) {
    await clientCtx.watch()
  } else {
    await clientCtx.rebuild()
  }
}

/**
 * Build Server
 */

let spawn

{
  const serverCtx = await esbuild.context({
    entryPoints: ['src/server/index.js'],
    outfile: 'build/index.js',
    platform: 'node',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    minify: false,
    sourcemap: true,
    packages: 'external',
    define: {
      'process.env.CLIENT': 'false',
      'process.env.SERVER': 'true',
    },
    plugins: [
      {
        name: 'server-finalize-plugin',
        setup(build) {
          // Handle world imports
          build.onResolve({ filter: /^\.\.\/worlds\// }, args => {
            const absolutePath = path.join(rootDir, args.path.replace('../', ''))
            return { path: absolutePath }
          })

          // Handle three.js imports
          build.onResolve({ filter: /^three$/ }, args => {
            return { external: true }
          })
          
          build.onEnd(async result => {
            // copy over physx wasm
            const physxWasmSrc = path.join(rootDir, 'src/server/physx/physx-js-webidl.wasm')
            const physxWasmDest = path.join(rootDir, 'build/physx-js-webidl.wasm')
            await fs.copy(physxWasmSrc, physxWasmDest)
            
            // Copy worlds directory with all assets
            const worldsSrc = path.join(rootDir, 'worlds')
            const worldsDest = path.join(clientBuildDir, 'worlds')
            console.log('Copying worlds from:', worldsSrc)
            console.log('Copying worlds to:', worldsDest)
            await fs.ensureDir(worldsDest)
            await fs.copy(worldsSrc, worldsDest, {
              filter: (src) => {
                console.log('Copying file:', src)
                return true
              }
            })
            
            if (dev) {
              spawn?.kill('SIGTERM')
              spawn = fork(path.join(rootDir, 'build/index.js'))
            } else {
              process.exit(1)
            }
          })
        },
      },
    ],
    loader: {
      '.js': 'jsx',
      '.glb': 'file',
      '.gltf': 'file',
    },
  })
  if (dev) {
    await serverCtx.watch()
  } else {
    await serverCtx.rebuild()
  }
}
