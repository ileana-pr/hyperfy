import './bootstrap'

import fs from 'fs-extra'
import path from 'path'
import { pipeline } from 'stream/promises'
import Fastify from 'fastify'
import ws from '@fastify/websocket'
import cors from '@fastify/cors'
import compress from '@fastify/compress'
import statics from '@fastify/static'
import multipart from '@fastify/multipart'

import { loadPhysX } from './physx/loadPhysX'
import { config } from './config'
import { createServerWorld } from '../core/createServerWorld'
import { hashFile } from '../core/utils-server'

const rootDir = process.cwd()
const worldPath = path.join(rootDir, 'worlds/vipe/scene.js')
const { VIPEWorld } = await import(worldPath)

const worldDir = path.join(rootDir, config.worldPath)
const assetsDir = path.join(rootDir, config.assetsPath)
const worldsDir = path.join(rootDir, 'worlds')
const vipeAssetsDir = path.join(rootDir, 'worlds/vipe/assets')
const publicDir = path.join(rootDir, 'public')
const port = process.env.PORT

await fs.ensureDir(worldDir)
await fs.ensureDir(assetsDir)
await fs.ensureDir(publicDir)

// copy core assets
await fs.copy(path.join(rootDir, 'src/core/assets'), path.join(assetsDir))

// ensure VIPE assets directory exists and copy assets if needed
await fs.ensureDir(vipeAssetsDir)

// copy VIPE assets to build if they don't exist
const buildVipeAssetsDir = path.join(rootDir, 'build/worlds/vipe/assets')
await fs.ensureDir(buildVipeAssetsDir)
await fs.copy(vipeAssetsDir, buildVipeAssetsDir, { overwrite: true })

const world = createServerWorld()
world.init({ loadPhysX })

// Initialize our custom world
const vipeWorld = new VIPEWorld(world)
await vipeWorld.init()

const fastify = Fastify({ logger: { level: 'error' } })

fastify.register(cors)
fastify.register(compress)

// Register static file serving for public directory first
fastify.register(statics, {
  root: publicDir,
  prefix: '/',
  serve: true,
  decorateReply: true
})

fastify.register(statics, {
  root: worldsDir,
  prefix: '/worlds/',
  decorateReply: false,
  setHeaders: res => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString())
  },
})
fastify.register(statics, {
  root: assetsDir,
  prefix: '/assets/',
  decorateReply: false,
  setHeaders: res => {
    // all assets are hashed & immutable so we can use aggressive caching
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString()) // older browsers
  },
})
fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
})
fastify.register(ws)
fastify.register(worldNetwork)

// Add root route handler to serve index.html
fastify.get('/', async (request, reply) => {
  return reply.type('text/html').send(await fs.readFile(path.join(publicDir, 'index.html')))
})

// Add route for client.js
fastify.get('/client.js', async (request, reply) => {
  return reply.type('application/javascript').send(await fs.readFile(path.join(publicDir, 'client.js')))
})

fastify.post('/api/upload', async (req, reply) => {
  const file = await req.file()
  const ext = file.filename.split('.').pop().toLowerCase()
  // create temp buffer to store contents
  const chunks = []
  for await (const chunk of file.file) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)
  // hash from buffer
  const hash = await hashFile(buffer)
  const filename = `${hash}.${ext}`
  // save to fs
  const filePath = path.join(assetsDir, filename)
  const exists = await fs.exists(filePath)
  if (!exists) {
    await fs.writeFile(filePath, buffer)
  }
})

fastify.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.status(500).send()
})

try {
  await fastify.listen({ port })
} catch (err) {
  console.error(err)
  console.error(`failed to launch on port ${port}`)
  process.exit(1)
}

async function worldNetwork(fastify) {
  fastify.get('/ws', { websocket: true }, ws => {
    world.network.onConnection(ws)
  })
}

console.log(`running on port ${port}`)
