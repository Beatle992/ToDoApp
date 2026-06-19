import { useState } from 'react'

const PROTECTED = ['All', 'Inbox', 'Personal', 'Completed']

export default function Sidebar({
  open,
  groups,
  allGroups,
  selectedGroup,
  counts,
  openMenu,
  onNavigate,
  onToggleMenu,
  onDeleteGroup,
  onAddGroup,
}) {
  const [newGroup, setNewGroup] = useState('')
  const [shake, setShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const result = onAddGroup(newGroup)
    if (result.ok) {
      setNewGroup('')
    } else {
      // duplicate or empty name: shake the input instead of silently no-op'ing
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }
  }

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <p className="sidebar-title">My Lists</p>

      {allGroups.map(group => (
        <div key={group} className="group-row">
          <button
            className={`group-btn${selectedGroup === group ? ' active' : ''}`}
            onClick={() => onNavigate(group)}
          >
            {group === 'All' && '📋 '}
            {group === 'Completed' && '✓ '}
            {group}
            {group !== 'All' && group !== 'Completed' && counts[group] > 0 && (
              <span className="group-count">{counts[group]}</span>
            )}
          </button>

          {!PROTECTED.includes(group) && (
            <div className="group-menu-wrapper" onClick={e => e.stopPropagation()}>
              <button
                className="menu-btn"
                onClick={() => onToggleMenu(group)}
                aria-label={`Options for ${group}`}
              >
                ⋯
              </button>
              {openMenu === group && (
                <div className="menu-dropdown">
                  <button onClick={() => onDeleteGroup(group)}>🗑 Delete group</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <hr className="sidebar-divider" />

      <form className={`group-form${shake ? ' shake' : ''}`} onSubmit={handleSubmit}>
        <input
          placeholder="New group…"
          value={newGroup}
          onChange={e => setNewGroup(e.target.value)}
        />
        <button type="submit" aria-label="Add group">＋</button>
      </form>
    </aside>
  )
}
