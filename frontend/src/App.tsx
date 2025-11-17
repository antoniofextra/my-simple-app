import { type FormEvent, useEffect, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState<{ id: number; title: string; completed: boolean }[]>([])
  const [title, setTitle] = useState('')
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
        body: JSON.stringify({ title: title.trim() }),
      })
      if (!res.ok) {
        throw new Error(`Failed to create todo: ${res.statusText}`)
      }
      setTitle('')
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

  return (
    <div className="App">
      <h1>Todos</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New todo title"
          data-testid="todo-input"
        />
        <button type="submit" data-testid="add-button">Add</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} data-testid={`todo-${todo.id}`}>
            <span>{todo.title}</span>
            {todo.completed ? '✅' : ''}
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
