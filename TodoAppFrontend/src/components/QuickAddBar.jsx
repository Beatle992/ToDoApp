import { forwardRef } from 'react'
import DateInput from './DateInput'

const QuickAddBar = forwardRef(function QuickAddBar(
  { title, onTitleChange, dueDate, onDueDateChange, group, groups, onGroupChange, onSubmit },
  titleRef
) {
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.currentTarget.blur()
      onTitleChange('')
    }
  }

  return (
    <form className="quick-add-bar" onSubmit={onSubmit}>
      <input
        ref={titleRef}
        className="title-input"
        type="text"
        placeholder="Add a task…"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <DateInput value={dueDate} onChange={e => onDueDateChange(e.target.value)} />
      <select value={group} onChange={e => onGroupChange(e.target.value)}>
        {groups.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <button type="submit">+ Add</button>
    </form>
  )
})

export default QuickAddBar
