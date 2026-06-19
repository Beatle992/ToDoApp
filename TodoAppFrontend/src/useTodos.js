import { useCallback, useEffect, useState } from 'react'

const API = 'http://100.90.164.103:5000/api/todos'

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.status === 204 ? null : res.json()
}

/**
 * Owns the todo list, loading/error state, and all CRUD operations.
 * Toggle and delete are optimistic: the UI updates immediately and rolls
 * back if the request fails, rather than waiting on a full reload.
 * `pendingIds` tracks which specific rows have an in-flight request, so
 * the UI can show a per-row spinner instead of a single global loader.
 */
export function useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingIds, setPendingIds] = useState(() => new Set())

  const setPending = useCallback((id, isPending) => {
    setPendingIds(prev => {
      const next = new Set(prev)
      if (isPending) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const loadTodos = useCallback(async () => {
    try {
      setError(null)
      const data = await apiFetch(API)
      setTodos(data)
    } catch (err) {
      setError(`Could not reach the API. Make sure the backend is running.\n(${err.message})`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTodos() }, [loadTodos])

  const addTodo = useCallback(async (payload) => {
    try {
      await apiFetch(API, { method: 'POST', body: JSON.stringify(payload) })
      await loadTodos()
      return true
    } catch (err) {
      setError(`Failed to create todo: ${err.message}`)
      return false
    }
  }, [loadTodos])

  const toggleTodo = useCallback(async (todo) => {
    const previous = todos
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))
    setPending(todo.id, true)
    try {
      await apiFetch(`${API}/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      })
    } catch (err) {
      setTodos(previous)
      setError(`Failed to update todo: ${err.message}`)
    } finally {
      setPending(todo.id, false)
    }
  }, [todos, setPending])

  const editTodo = useCallback(async (todo, changes) => {
    const previous = todos
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, ...changes } : t))
    setPending(todo.id, true)
    try {
      await apiFetch(`${API}/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...todo, ...changes }),
      })
    } catch (err) {
      setTodos(previous)
      setError(`Failed to save changes: ${err.message}`)
    } finally {
      setPending(todo.id, false)
    }
  }, [todos, setPending])

  const deleteTodo = useCallback(async (id) => {
    const previous = todos
    setTodos(prev => prev.filter(t => t.id !== id))
    setPending(id, true)
    try {
      await apiFetch(`${API}/${id}`, { method: 'DELETE' })
    } catch (err) {
      setTodos(previous)
      setError(`Failed to delete todo: ${err.message}`)
    } finally {
      setPending(id, false)
    }
  }, [todos, setPending])

  return { todos, loading, error, setError, pendingIds, addTodo, toggleTodo, editTodo, deleteTodo }
}
