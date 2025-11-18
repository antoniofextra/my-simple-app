import { type FormEvent, useEffect, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState<{ id: number; title: string; location?: string | null; completed: boolean }[]>([])
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('http://localhost:4000/api/todos')
      if (!res.ok) {
        throw new Error(`Failed to fetch todos: ${res.statusText}`)
      }
      const data = await res.json()
      setTodos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTodos()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return

    try {
      setError(null)
      const res = await fetch('http://localhost:4000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(),
          location: location.trim() || undefined,
        }),
      })
      if (!res.ok) {
        throw new Error(`Failed to create todo: ${res.statusText}`)
      }
      setTitle('')
      setLocation('')
      await loadTodos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setError(null)
      const res = await fetch(`http://localhost:4000/api/todos/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error(`Failed to delete todo: ${res.statusText}`)
      }
      await loadTodos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDeleteAll = async () => {
    try {
      setError(null)
      const res = await fetch('http://localhost:4000/api/todos', {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error(`Failed to delete all todos: ${res.statusText}`)
      }
      await loadTodos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="App">
      <h1>Todos</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New todo title"
            data-testid="todo-input"
            required
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value.slice(0, 20))}
            placeholder="Location (optional, max 20 chars)"
            maxLength={20}
            data-testid="location-input"
          />
          <button type="submit" data-testid="add-button">Add</button>
        </div>
        {location && (
          <p style={{ margin: '0', fontSize: '0.875rem', color: '#666' }}>
            Location: {location.length}/20 characters
          </p>
        )}
      </form>

      {todos.length > 0 && (
        <button 
          onClick={handleDeleteAll} 
          data-testid="delete-all-button"
          style={{ marginBottom: '1rem' }}
        >
          Delete All
        </button>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} data-testid={`todo-${todo.id}`} style={{ marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 'bold' }}>{todo.title}</span>
              {todo.completed ? '✅' : ''}
            </div>
            {todo.location && (
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }} data-testid={`todo-location-${todo.id}`}>
                📍 {todo.location}
              </div>
            )}
            <button onClick={() => handleDelete(todo.id)} data-testid={`delete-${todo.id}`}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
