import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Change this to match wherever your API is running.
// If the frontend is served from the same origin as the API you can use '/api/todos'.
const API = 'http://100.90.164.103:5000/api/todos'

const DEFAULT_GROUPS = ['Inbox', 'Personal']
const GROUPS_KEY = 'todo-app-groups'

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_GROUPS
  } catch {
    return DEFAULT_GROUPS
  }
}

function saveGroups(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups))
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  // Data
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Groups (persisted in localStorage)
  const [groups, setGroups] = useState(loadGroups)

  // Navigation
  const [selectedGroup, setSelectedGroup] = useState('All')

  // Quick-add form
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formGroup, setFormGroup] = useState('')

  // UI state
  const [newGroup, setNewGroup] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const titleRef = useRef(null)

  // ── API helpers ─────────────────────────────────────────────────────────────

  async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    return res.status === 204 ? null : res.json()
  }

  async function loadTodos() {
    try {
      setError(null)
      const data = await apiFetch(API)
      setTodos(data)
    } catch (err) {
      setError(`Could not reach the API. Make sure the backend is running.\n(${err.message})`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTodos() }, [])

  // ── Groups ──────────────────────────────────────────────────────────────────

  const allGroups = useMemo(() => ['All', ...groups, 'Completed'], [groups])

  // The group a new todo will land in: whichever filter is active (unless it's
  // a virtual filter like All / Completed, in which case fall back to first real group).
  const defaultNewGroup = useMemo(() => {
    if (selectedGroup !== 'All' && selectedGroup !== 'Completed') return selectedGroup
    return groups[0] ?? 'Inbox'
  }, [selectedGroup, groups])

  function addGroup(e) {
    e.preventDefault()
    const name = newGroup.trim()
    if (!name || groups.includes(name)) return
    const updated = [...groups, name]
    setGroups(updated)
    saveGroups(updated)
    setNewGroup('')
  }

  function deleteGroup(group) {
    const updated = groups.filter(g => g !== group)
    setGroups(updated)
    saveGroups(updated)
    setOpenMenu(null)
    if (selectedGroup === group) setSelectedGroup('All')
  }

  // ── Todos ───────────────────────────────────────────────────────────────────

  async function addTodo(e) {
    e.preventDefault()
    if (!title.trim()) {
      titleRef.current?.focus()
      return
    }

    // Which group is this todo going into?
    const group = formGroup || defaultNewGroup

    const payload = {
      title: title.trim(),
      completed: false,
      priority: 1,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || null,
      groupName: group,
    }

    try {
      await apiFetch(API, { method: 'POST', body: JSON.stringify(payload) })
      setTitle('')
      setDueDate('')
      setFormGroup('')
      await loadTodos()
    } catch (err) {
      setError(`Failed to create todo: ${err.message}`)
    }
  }

  async function toggleTodo(todo) {
    try {
      await apiFetch(`${API}/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      })
      await loadTodos()
    } catch (err) {
      setError(`Failed to update todo: ${err.message}`)
    }
  }

  async function deleteTodo(id) {
    try {
      await apiFetch(`${API}/${id}`, { method: 'DELETE' })
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(`Failed to delete todo: ${err.message}`)
    }
  }

  // ── Filtered list ───────────────────────────────────────────────────────────

  const filteredTodos = useMemo(() => {
    return [...todos]
      .filter(todo => {
        if (selectedGroup === 'Completed') return todo.completed
        if (todo.completed) return false
        if (selectedGroup === 'All') return true
        return (todo.groupName || 'Inbox') === selectedGroup
      })
      .sort((a, b) =>
        new Date(a.dueDate || a.createdAt) - new Date(b.dueDate || b.createdAt)
      )
  }, [todos, selectedGroup])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function navigate(group) {
    setSelectedGroup(group)
    setSidebarOpen(false)
    setOpenMenu(null)
    // Pre-fill the group selector for quick-add
    if (group !== 'All' && group !== 'Completed') setFormGroup(group)
    else setFormGroup('')
  }

  function formatDate(iso) {
    if (!iso) return null
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((d - now) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="app" onClick={() => setOpenMenu(null)}>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* BURGER */}
      <button className="menu-toggle" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle menu">
        ☰
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <p className="sidebar-title">My Lists</p>

        {/* Virtual filters */}
        {allGroups.map(group => (
          <div key={group} className="group-row">
            <button
              className={`group-btn${selectedGroup === group ? ' active' : ''}`}
              onClick={() => navigate(group)}
            >
              {group === 'All' && '📋 '}
              {group === 'Completed' && '✓ '}
              {group}
              {group !== 'All' && group !== 'Completed' && (
                <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.6 }}>
                  {todos.filter(t => !t.completed && (t.groupName || 'Inbox') === group).length || ''}
                </span>
              )}
            </button>

            {/* Delete menu for custom groups */}
            {!['All', 'Inbox', 'Personal', 'Completed'].includes(group) && (
              <div className="group-menu-wrapper" onClick={e => e.stopPropagation()}>
                <button
                  className="menu-btn"
                  onClick={() => setOpenMenu(openMenu === group ? null : group)}
                  aria-label={`Options for ${group}`}
                >
                  ⋯
                </button>
                {openMenu === group && (
                  <div className="menu-dropdown">
                    <button onClick={() => deleteGroup(group)}>🗑 Delete group</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <hr className="sidebar-divider" />

        {/* Add group */}
        <form className="group-form" onSubmit={addGroup}>
          <input
            placeholder="New group…"
            value={newGroup}
            onChange={e => setNewGroup(e.target.value)}
          />
          <button type="submit" aria-label="Add group">＋</button>
        </form>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
        <div className="content-header">
          <h1>
            {selectedGroup === 'All' ? 'All Tasks' :
             selectedGroup === 'Completed' ? 'Completed' :
             selectedGroup}
          </h1>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner">
            ⚠ {error}
          </div>
        )}

        {/* Quick-add bar (hidden in Completed view) */}
        {selectedGroup !== 'Completed' && (
          <form className="quick-add-bar" onSubmit={addTodo}>
            <input
              ref={titleRef}
              className="title-input"
              type="text"
              placeholder="Add a task…"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <select
              value={formGroup || defaultNewGroup}
              onChange={e => setFormGroup(e.target.value)}
            >
              {groups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button type="submit">+ Add</button>
          </form>
        )}

        {/* Todo list */}
        {loading ? (
          <div className="loading">Loading…</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <span>{selectedGroup === 'Completed' ? '🎉' : '✓'}</span>
            {selectedGroup === 'Completed'
              ? 'Nothing completed yet.'
              : 'No tasks here. Add one above!'}
          </div>
        ) : (
          <div className="todo-list">
            {filteredTodos.map(todo => (
              <div key={todo.id} className={`todo${todo.completed ? ' done' : ''}`}>
                <button
                  className="check-btn"
                  onClick={() => toggleTodo(todo)}
                  aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.completed ? '✓' : ''}
                </button>

                <div className="todo-content">
                  <div className="todo-title">{todo.title}</div>
                  <div className="todo-meta">
                    <span className="meta-group">{todo.groupName || 'Inbox'}</span>
                    {todo.dueDate && (
                      <span>{formatDate(todo.dueDate)}</span>
                    )}
                  </div>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
