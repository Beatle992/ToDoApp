import { useEffect, useRef, useState } from 'react'

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

function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false
  return new Date(todo.dueDate) < new Date()
}

export default function TodoItem({ todo, pending, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function startEdit() {
    if (pending) return
    setDraft(todo.title)
    setEditing(true)
  }

  function commit() {
    const trimmed = draft.trim()
    setEditing(false)
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo, { title: trimmed })
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      setDraft(todo.title)
      setEditing(false)
    }
  }

  const overdue = isOverdue(todo)
  const dateLabel = formatDate(todo.dueDate)

  return (
    <div className={`todo${todo.completed ? ' done' : ''}${pending ? ' pending' : ''}${overdue ? ' overdue' : ''}`}>
      <button
        className="check-btn"
        onClick={() => onToggle(todo)}
        disabled={pending}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {pending ? <span className="spinner" /> : (todo.completed ? '✓' : '')}
      </button>

      <div className="todo-content">
        {editing ? (
          <input
            ref={inputRef}
            className="todo-edit-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="todo-title" onClick={startEdit} title="Click to edit">
            {todo.title}
          </div>
        )}
        <div className="todo-meta">
          <span className="meta-group">{todo.groupName || 'Inbox'}</span>
          {dateLabel && (
            <span className={overdue ? 'meta-overdue' : ''}>
              {overdue && '⚠ '}{dateLabel}
            </span>
          )}
        </div>
      </div>

      <button
        className="delete-btn"
        onClick={() => onDelete(todo.id)}
        disabled={pending}
        aria-label="Delete task"
      >
        ✕
      </button>
    </div>
  )
}
