import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

describe('Todo API', () => {
  let app: FastifyInstance
  let prisma: PrismaClient

  beforeAll(async () => {
    // Create a test instance of Prisma
    prisma = new PrismaClient()
    
    // Ensure database schema is set up
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS Todo')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Todo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        location TEXT,
        completed BOOLEAN NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Set up Fastify app
    app = Fastify()
    
    await app.register(cors, {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
    })

    app.get('/api/todos', async () => {
      return prisma.todo.findMany({ orderBy: { createdAt: 'desc' } })
    })

    app.post<{ Body: { title: string; location?: string } }>('/api/todos', async (request, reply) => {
      const { title, location } = request.body
      // Validate and truncate location to max 20 chars if provided
      const sanitizedLocation = location ? location.slice(0, 20).trim() || null : null
      const todo = await prisma.todo.create({ data: { title, location: sanitizedLocation } })
      reply.code(201).send(todo)
    })

    app.delete<{ Params: { id: string } }>('/api/todos/:id', async (request, reply) => {
      const id = Number(request.params.id)
      await prisma.todo.delete({ where: { id } })
      reply.code(204).send()
    })

    app.delete('/api/todos', async (request, reply) => {
      await prisma.todo.deleteMany()
      reply.code(204).send()
    })

    await app.ready()
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.todo.deleteMany()
  })

  describe('GET /api/todos', () => {
    it('returns an empty array when no todos exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual([])
    })

    it('returns all todos in descending order by createdAt', async () => {
      // Create test todos
      const todo1 = await prisma.todo.create({
        data: { title: 'First Todo' },
      })
      await new Promise(resolve => setTimeout(resolve, 10)) // Small delay
      const todo2 = await prisma.todo.create({
        data: { title: 'Second Todo' },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
      })

      expect(response.statusCode).toBe(200)
      const todos = JSON.parse(response.body)
      expect(todos).toHaveLength(2)
      expect(todos[0].id).toBe(todo2.id) // Most recent first
      expect(todos[1].id).toBe(todo1.id)
    })
  })

  describe('POST /api/todos', () => {
    it('creates a new todo and returns 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Todo' }),
      })

      expect(response.statusCode).toBe(201)
      const todo = JSON.parse(response.body)
      expect(todo).toMatchObject({
        title: 'New Todo',
        completed: false,
      })
      expect(todo.id).toBeDefined()
      expect(todo.createdAt).toBeDefined()
    })

    it('persists the todo in the database', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/todos',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Persistent Todo' }),
      })

      const todos = await prisma.todo.findMany()
      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('Persistent Todo')
    })

    it('creates a todo with location', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Todo with location', location: 'Home' }),
      })

      expect(response.statusCode).toBe(201)
      const todo = JSON.parse(response.body)
      expect(todo).toMatchObject({
        title: 'Todo with location',
        location: 'Home',
        completed: false,
      })
    })

    it('creates a todo without location', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Todo without location' }),
      })

      expect(response.statusCode).toBe(201)
      const todo = JSON.parse(response.body)
      expect(todo).toMatchObject({
        title: 'Todo without location',
        location: null,
        completed: false,
      })
    })

    it('truncates location to max 20 characters', async () => {
      const longLocation = 'This is a very long location'
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Todo with long location', location: longLocation }),
      })

      expect(response.statusCode).toBe(201)
      const todo = JSON.parse(response.body)
      expect(todo.location).toBe('This is a very long')
      expect(todo.location).toHaveLength(20)
    })
  })

  describe('DELETE /api/todos/:id', () => {
    it('deletes a todo and returns 204', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Todo to delete' },
      })

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/todos/${todo.id}`,
      })

      expect(response.statusCode).toBe(204)
      expect(response.body).toBe('')
    })

    it('removes the todo from the database', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Todo to delete' },
      })

      await app.inject({
        method: 'DELETE',
        url: `/api/todos/${todo.id}`,
      })

      const todos = await prisma.todo.findMany()
      expect(todos).toHaveLength(0)
    })

    it('returns error when todo does not exist', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/todos/99999',
      })

      expect(response.statusCode).toBe(500) // Prisma throws error
    })
  })

  describe('DELETE /api/todos', () => {
    it('deletes all todos and returns 204', async () => {
      // Create multiple todos
      await prisma.todo.create({ data: { title: 'Todo 1' } })
      await prisma.todo.create({ data: { title: 'Todo 2' } })
      await prisma.todo.create({ data: { title: 'Todo 3' } })

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/todos',
      })

      expect(response.statusCode).toBe(204)
      expect(response.body).toBe('')
    })

    it('removes all todos from the database', async () => {
      // Create multiple todos
      await prisma.todo.create({ data: { title: 'Todo 1' } })
      await prisma.todo.create({ data: { title: 'Todo 2' } })
      await prisma.todo.create({ data: { title: 'Todo 3' } })

      await app.inject({
        method: 'DELETE',
        url: '/api/todos',
      })

      const todos = await prisma.todo.findMany()
      expect(todos).toHaveLength(0)
    })

    it('works successfully when no todos exist', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/todos',
      })

      expect(response.statusCode).toBe(204)
      
      const todos = await prisma.todo.findMany()
      expect(todos).toHaveLength(0)
    })
  })

  describe('CORS', () => {
    it('includes CORS headers for allowed origin', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
        headers: {
          origin: 'http://localhost:5173',
        },
      })

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })
  })
})

