import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { useTodos } from './hooks/useTodos'
import { useGroups } from './hooks/useGroups'
import Sidebar from './components/Sidebar'
import QuickAddBar from './components/QuickAddBar'
import TodoItem from './components/TodoItem'
import ErrorBanner from './components/ErrorBanner'

export default function App() {
  const { todos, loading, error, setError, pendingIds, addTodo, toggleTodo, editTodo, deleteTodo } = useTodos()
  const { groups, addGroup, deleteGroup } = useGroups()

  const [selectedGroup, setSelectedGroup] = useState('All')

  // Quick-add form
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formGroup, setFormGroup] = useState('')

  // UI state
  const [openMenu, setOpenMenu] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const titleRef = useRef(null)

  const allGroups = useMemo(() => ['All', ...groups, 'Completed'], [groups])

  const defaultNewGroup = useMemo(() => {
    if (selectedGroup !== 'All' && selectedGroup !== 'Completed') return selectedGroup
    return groups[0] ?? 'Inbox'
  }, [selectedGroup, groups])

  // Active-count per group, shown as a badge in the sidebar
  const counts = useMemo(() => {
    const c = {}
    for (const g of groups) {
      c[g] = todos.filter(t => !t.completed && (t.groupName || 'Inbox') === g).length
    }
    return c
  }, [todos, groups])

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

  // Close any open menu on Escape, from anywhere in the app
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        if (sidebarOpen) setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  function navigate(group) {
    setSelectedGroup(group)
    setSidebarOpen(false)
    setOpenMenu(null)
    if (group !== 'All' && group !== 'Completed') setFormGroup(group)
    else setFormGroup('')
  }

  function handleDeleteGroup(group) {
    deleteGroup(group)
    setOpenMenu(null)
    if (selectedGroup === group) setSelectedGroup('All')
  }

  async function handleAddTodo(e) {
    e.preventDefault()
    if (!title.trim()) {
      titleRef.current?.focus()
      return
    }

    const payload = {
      title: title.trim(),
      completed: false,
      priority: 1,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || null,
      groupName: formGroup || defaultNewGroup,
    }

    const ok = await addTodo(payload)
    if (ok) {
      setTitle('')
      setDueDate('')
      setFormGroup('')
      titleRef.current?.focus()
    }
  }

  return (
    <div className="app" onClick={() => setOpenMenu(null)}>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <button className="menu-toggle" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle menu">
        ☰
      </button>

      <Sidebar
        open={sidebarOpen}
        groups={groups}
        allGroups={allGroups}
        selectedGroup={selectedGroup}
        counts={counts}
        openMenu={openMenu}
        onNavigate={navigate}
        onToggleMenu={(g) => setOpenMenu(openMenu === g ? null : g)}
        onDeleteGroup={handleDeleteGroup}
        onAddGroup={addGroup}
      />

      <main className="content">
        <div className="content-header">
          <h1>
            {selectedGroup === 'All' ? 'All Tasks' :
             selectedGroup === 'Completed' ? 'Completed' :
             selectedGroup}
          </h1>
        </div>

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {selectedGroup !== 'Completed' && (
          <QuickAddBar
            ref={titleRef}
            title={title}
            onTitleChange={setTitle}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            group={formGroup || defaultNewGroup}
            groups={groups}
            onGroupChange={setFormGroup}
            onSubmit={handleAddTodo}
          />
        )}

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
              <TodoItem
                key={todo.id}
                todo={todo}
                pending={pendingIds.has(todo.id)}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
