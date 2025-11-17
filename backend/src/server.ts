import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const fastify = Fastify({ logger: true })
const prisma = new PrismaClient()

fastify.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
})

fastify.get('/api/todos', async () => {
  return prisma.todo.findMany({ orderBy: { createdAt: 'desc' } })
})

fastify.post('/api/todos', async (request, reply) => {
  const { title } = request.body as { title: string }
  const todo = await prisma.todo.create({ data: { title } })
  reply.code(201).send(todo)
})

fastify.delete('/api/todos/:id', async (request, reply) => {
  const id = Number((request.params as any).id)
  await prisma.todo.delete({ where: { id } })
  reply.code(204).send()
})

const start = async () => {
  try {
    await fastify.listen({ port: 4000 })
    fastify.log.info('Server ready')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()