import { useState } from 'react'

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

function persist(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups))
}

export function useGroups() {
  const [groups, setGroups] = useState(loadGroups)

  function addGroup(name) {
    const trimmed = name.trim()
    if (!trimmed) return { ok: false, reason: 'empty' }
    if (groups.includes(trimmed)) return { ok: false, reason: 'duplicate' }
    const updated = [...groups, trimmed]
    setGroups(updated)
    persist(updated)
    return { ok: true }
  }

  function deleteGroup(name) {
    const updated = groups.filter(g => g !== name)
    setGroups(updated)
    persist(updated)
  }

  return { groups, addGroup, deleteGroup }
}
