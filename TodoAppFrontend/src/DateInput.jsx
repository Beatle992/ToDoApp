/**
 * <input type="datetime-local"> ignores the `placeholder` attribute by spec —
 * every browser shows its own "mm/dd/yyyy --:--" hint regardless of what you
 * pass. To get a real placeholder, we float a label over the field and only
 * show it while the input is empty and unfocused; the native hint is hidden
 * underneath via the `.dt-input` CSS until the user actually interacts.
 */
import { useState } from 'react'

export default function DateInput({ value, onChange, label = 'Due date' }) {
  const [focused, setFocused] = useState(false)
  const showPlaceholder = !value && !focused

  return (
    <div className="dt-field">
      <input
        type="datetime-local"
        className="dt-input"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        data-empty={showPlaceholder}
      />
      {showPlaceholder && <span className="dt-placeholder">{label}</span>}
    </div>
  )
}
