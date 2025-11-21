import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const fastify = Fastify({ logger: true })
let prisma: PrismaClient | null = null

fastify.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
})

// Health check endpoint that doesn't require database
fastify.get('/health', async () => {
  return { status: 'ok' }
})

fastify.get('/api/todos', async () => {
  if (!prisma) throw new Error('Database not initialized')
  return prisma.todo.findMany({ orderBy: { createdAt: 'desc' } })
})

fastify.post('/api/todos', async (request, reply) => {
  if (!prisma) throw new Error('Database not initialized')
  const { title, location } = request.body as { title: string; location?: string }
  // Validate and truncate location to max 20 chars if provided
  const sanitizedLocation = location ? location.slice(0, 20).trim() || null : null
  const todo = await prisma.todo.create({ data: { title, location: sanitizedLocation } })
  reply.code(201).send(todo)
})

fastify.delete('/api/todos/:id', async (request, reply) => {
  if (!prisma) throw new Error('Database not initialized')
  const id = Number((request.params as any).id)
  await prisma.todo.delete({ where: { id } })
  reply.code(204).send()
})

fastify.delete('/api/todos', async (request, reply) => {
  if (!prisma) throw new Error('Database not initialized')
  await prisma.todo.deleteMany()
  reply.code(204).send()
})

async function initializeDatabase() {
  let retries = 3
  let connected = false
  
  while (retries > 0 && !connected) {
    try {
      prisma = new PrismaClient()
      await prisma.$connect()
      fastify.log.info('Database connected')
      connected = true
    } catch (dbErr) {
      retries--
      if (retries > 0) {
        fastify.log.warn(`Failed to connect to database, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        fastify.log.warn(`Failed to connect to database after retries: ${String(dbErr)}`)
        throw dbErr
      }
    }
  }
}

const start = async () => {
  try {
    // Initialize database connection
    await initializeDatabase()

    await fastify.listen({ port: 4000 })
    fastify.log.info('Server ready on port 4000')
  } catch (err) {
    fastify.log.error(`Failed to start server: ${String(err)}`)
    process.exit(1)
  }
}

start()