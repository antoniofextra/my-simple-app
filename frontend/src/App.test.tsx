import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import App from './App'

// Mock fetch
globalThis.fetch = vi.fn()

function createFetchResponse(data: unknown) {
  return {
    ok: true,
    json: async () => data,
  }
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the heading', () => {
    vi.mocked(fetch).mockResolvedValue(createFetchResponse([]) as Response)
    
    render(<App />)
    
    expect(screen.getByRole('heading', { name: /todos/i })).toBeInTheDocument()
  })

  it('renders input field and add button', () => {
    vi.mocked(fetch).mockResolvedValue(createFetchResponse([]) as Response)
    
    render(<App />)
    
    expect(screen.getByPlaceholderText(/new todo title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('loads and displays todos on mount', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo 1', location: null, completed: false, createdAt: new Date().toISOString() },
      { id: 2, title: 'Test Todo 2', location: 'Home', completed: false, createdAt: new Date().toISOString() },
    ]

    vi.mocked(fetch).mockResolvedValue(createFetchResponse(mockTodos) as Response)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument()
    })
  })

  it('submits a new todo when form is submitted', async () => {
    const user = userEvent.setup()
    const mockTodos = [
      { id: 1, title: 'New Todo', location: null, completed: false, createdAt: new Date().toISOString() },
    ]

    // First call: initial load (empty)
    // Second call: POST response
    // Third call: reload after POST
    vi.mocked(fetch)
      .mockResolvedValueOnce(createFetchResponse([]) as Response)
      .mockResolvedValueOnce(createFetchResponse(mockTodos[0]) as Response)
      .mockResolvedValueOnce(createFetchResponse(mockTodos) as Response)

    render(<App />)

    const input = screen.getByPlaceholderText(/new todo title/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await user.type(input, 'New Todo')
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument()
    })

    // Verify POST was called without location
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/todos',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Todo', location: undefined }),
      })
    )
  })

  it('does not submit empty todos', async () => {
    const user = userEvent.setup()
    
    vi.mocked(fetch).mockResolvedValue(createFetchResponse([]) as Response)

    render(<App />)

    const addButton = screen.getByRole('button', { name: /add/i })
    await user.click(addButton)

    // Should only call fetch once (initial load), not for POST
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('displays loading state', () => {
    vi.mocked(fetch).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<App />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error when fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('deletes a todo when delete button is clicked', async () => {
    const user = userEvent.setup()
    const mockTodos = [
      { id: 1, title: 'Todo to delete', location: null, completed: false, createdAt: new Date().toISOString() },
    ]

    // First call: initial load with todos
    // Second call: DELETE response
    // Third call: reload after DELETE (empty)
    vi.mocked(fetch)
      .mockResolvedValueOnce(createFetchResponse(mockTodos) as Response)
      .mockResolvedValueOnce({ ok: true, status: 204 } as Response)
      .mockResolvedValueOnce(createFetchResponse([]) as Response)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Todo to delete')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTestId('delete-1')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText('Todo to delete')).not.toBeInTheDocument()
    })

    // Verify DELETE was called
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/todos/1',
      expect.objectContaining({
        method: 'DELETE',
      })
    )
  })

  it('shows Delete All button when todos exist', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', location: null, completed: false, createdAt: new Date().toISOString() },
      { id: 2, title: 'Todo 2', location: 'Office', completed: false, createdAt: new Date().toISOString() },
    ]

    vi.mocked(fetch).mockResolvedValue(createFetchResponse(mockTodos) as Response)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('delete-all-button')).toBeInTheDocument()
    })
  })

  it('hides Delete All button when no todos exist', async () => {
    vi.mocked(fetch).mockResolvedValue(createFetchResponse([]) as Response)
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('delete-all-button')).not.toBeInTheDocument()
    })
  })

  it('deletes all todos when Delete All button is clicked', async () => {
    const user = userEvent.setup()
    const mockTodos = [
      { id: 1, title: 'Todo 1', location: null, completed: false, createdAt: new Date().toISOString() },
      { id: 2, title: 'Todo 2', location: 'Home', completed: false, createdAt: new Date().toISOString() },
      { id: 3, title: 'Todo 3', location: null, completed: false, createdAt: new Date().toISOString() },
    ]

    // First call: initial load with todos
    // Second call: DELETE ALL response
    // Third call: reload after DELETE ALL (empty)
    vi.mocked(fetch)
      .mockResolvedValueOnce(createFetchResponse(mockTodos) as Response)
      .mockResolvedValueOnce({ ok: true, status: 204 } as Response)
      .mockResolvedValueOnce(createFetchResponse([]) as Response)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument()
      expect(screen.getByText('Todo 2')).toBeInTheDocument()
      expect(screen.getByText('Todo 3')).toBeInTheDocument()
    })

    const deleteAllButton = screen.getByTestId('delete-all-button')
    await user.click(deleteAllButton)

    await waitFor(() => {
      expect(screen.queryByText('Todo 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Todo 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Todo 3')).not.toBeInTheDocument()
    })

    // Verify DELETE ALL was called
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/todos',
      expect.objectContaining({
        method: 'DELETE',
      })
    )
  })

  it('submits a new todo with location', async () => {
    const user = userEvent.setup()
    const mockTodos = [
      { id: 1, title: 'Todo with location', location: 'Office', completed: false, createdAt: new Date().toISOString() },
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce(createFetchResponse([]) as Response)
      .mockResolvedValueOnce(createFetchResponse(mockTodos[0]) as Response)
      .mockResolvedValueOnce(createFetchResponse(mockTodos) as Response)

    render(<App />)

    const titleInput = screen.getByPlaceholderText(/new todo title/i)
    const locationInput = screen.getByTestId('location-input')
    const addButton = screen.getByRole('button', { name: /add/i })

    await user.type(titleInput, 'Todo with location')
    await user.type(locationInput, 'Office')
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Todo with location')).toBeInTheDocument()
    })

    // Verify POST was called with location
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/todos',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Todo with location', location: 'Office' }),
      })
    )
  })

  it('displays location in todo item', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo with location', location: 'Kitchen', completed: false, createdAt: new Date().toISOString() },
    ]

    vi.mocked(fetch).mockResolvedValue(createFetchResponse(mockTodos) as Response)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Todo with location')).toBeInTheDocument()
      // Location text might be broken up by emoji, so use a more flexible matcher
      expect(screen.getByText((content, element) => {
        return element?.textContent?.includes('Kitchen') ?? false
      })).toBeInTheDocument()
    })
  })
})

