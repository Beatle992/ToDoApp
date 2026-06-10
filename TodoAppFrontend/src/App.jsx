import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API = 'http://100.90.164.103:5000/api/todos'

export default function App() {
  const [todos, setTodos] = useState([])

  // pages
  const [view, setView] = useState('list')

  // form state (ONLY what we need now)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')

  // UI state
  const [selectedGroup, setSelectedGroup] = useState('All')
  const [newGroup, setNewGroup] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const defaultGroups = ['Inbox']
  const [groups, setGroups] = useState(defaultGroups)

  async function loadTodos() {
    const res = await fetch(API)
    const data = await res.json()
    setTodos(data)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  async function addTodo(e) {
    e.preventDefault()

    if (!title.trim()) return

    const todo = {
      title: title.trim(),
      completed: false,
      priority: 1,
      createdAt: new Date().toISOString(),
      dueDate,

      groupName:
        selectedGroup !== 'All' && selectedGroup !== 'Completed'
          ? selectedGroup
          : 'Inbox',
    }

    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    })

    setTitle('')
    setDueDate('')
    setView('list')
    setSidebarOpen(false)

    loadTodos()
  }

  async function toggleTodo(todo) {
    await fetch(`${API}/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...todo,
        completed: !todo.completed,
        groupName: !todo.completed ? 'Completed' : 'Inbox',
      }),
    })

    loadTodos()
  }

  async function deleteTodo(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    loadTodos()
  }

  function addGroup(e) {
    e.preventDefault()

    const trimmed = newGroup.trim()
    if (!trimmed) return
    if (groups.includes(trimmed)) return

    setGroups([...groups, trimmed])
    setNewGroup('')
  }

  function deleteGroup(group) {
    setGroups(groups.filter((g) => g !== group))
    setOpenMenu(null)

    if (selectedGroup === group) setSelectedGroup('All')
  }

  const allGroups = useMemo(() => {
    return ['All', ...groups, 'Completed']
  }, [groups])

  const filteredTodos = useMemo(() => {
    return [...todos]
      .filter((todo) => {
        const group = todo.groupName || 'Inbox'

        if (selectedGroup === 'Completed') return todo.completed
        if (todo.completed) return false
        if (selectedGroup === 'All') return true

        return group === selectedGroup
      })
      .sort(
        (a, b) =>
          new Date(a.dueDate || a.createdAt) -
          new Date(b.dueDate || b.createdAt)
      )
  }, [todos, selectedGroup])

  return (
    <div className="app">

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* BURGER */}
      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>My Lists</h2>

        {/* NAV */}
        <p
          className="group"
          onClick={() => {
            setView('list')
            setSidebarOpen(false)
          }}
        >
          📋 Tasks
        </p>

        <button
          className="group"
          onClick={() => {
            setView('add')
            setSidebarOpen(false)
          }}
        >
          ➕ Add Todo
        </button>

        <hr style={{ border: '1px solid #1f2937', width: '100%' }} />

        {/* GROUPS */}
        {allGroups.map((group) => (
          <div key={group} className="group-row">
            <button
              className={
                selectedGroup === group ? 'group active' : 'group'
              }
              onClick={() => {
                setSelectedGroup(group)
                setView('list')
                setSidebarOpen(false)
              }}
            >
              {group}
            </button>

            {!['All', 'Inbox', 'Completed'].includes(group) && (
              <div className="group-menu-wrapper">
                <button
                  className="menu-btn"
                  onClick={() =>
                    setOpenMenu(openMenu === group ? null : group)
                  }
                >
                  ⋯
                </button>

                {openMenu === group && (
                  <div className="menu-dropdown">
                    <button onClick={() => deleteGroup(group)}>
                      Delete Group
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* ADD GROUP */}
        <form className="group-form" onSubmit={addGroup}>
          <input
            placeholder="New group..."
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          />
          <button type="submit">＋</button>
        </form>
      </aside>

      {/* CONTENT */}
      <main className="content">

        {/* LIST PAGE */}
        {view === 'list' && (
          <>
            <h1>{selectedGroup}</h1>

            <div className="todo-list">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={todo.completed ? 'todo completed' : 'todo'}
                >
                  <button
                    className="check-btn"
                    onClick={() => toggleTodo(todo)}
                  >
                    {todo.completed ? '✓' : '○'}
                  </button>

                  <div className="todo-content">
                    <div className="todo-title">{todo.title}</div>
                    <div className="todo-meta">
                      {todo.groupName || 'Inbox'}
                      {todo.dueDate &&
                        ` • ${new Date(todo.dueDate).toLocaleString()}`}
                    </div>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ADD PAGE */}
        {view === 'add' && (
          <>
            <h1>Add Todo</h1>

            <form className="todo-form" onSubmit={addTodo}>
              <input
                type="text"
                placeholder="Task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              {/* ✅ FIXED: now only shows groups */}
              <select
                value={
                  selectedGroup !== 'All' && selectedGroup !== 'Completed'
                    ? selectedGroup
                    : 'Inbox'
                }
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>

              <button type="submit">Create</button>
            </form>
          </>
        )}

      </main>
    </div>
  )
}
