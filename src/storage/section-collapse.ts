// storage/section-collapse.ts
import type { SectionKey } from "@/constants/sectionDescription"

const SECTION_COLLAPSE_STORAGE_KEY = "section-collapse-state"

export type SectionCollapseState = Partial<Record<SectionKey, boolean>>

export const getSectionCollapseState = (): SectionCollapseState => {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem(SECTION_COLLAPSE_STORAGE_KEY)
    if (!stored) return {}

    return JSON.parse(stored) as SectionCollapseState
  } catch {
    return {}
  }
}

export const getIsSectionCollapsed = (sectionKey: SectionKey): boolean => {
  const state = getSectionCollapseState()
  return state[sectionKey] ?? false
}

export const setSectionCollapsed = (
  sectionKey: SectionKey,
  isCollapsed: boolean
) => {
  const prevState = getSectionCollapseState()

  const nextState: SectionCollapseState = {
    ...prevState,
    [sectionKey]: isCollapsed,
  }

  localStorage.setItem(SECTION_COLLAPSE_STORAGE_KEY, JSON.stringify(nextState))
}

export const toggleSectionCollapsed = (sectionKey: SectionKey): boolean => {
  const current = getIsSectionCollapsed(sectionKey)
  const next = !current
  setSectionCollapsed(sectionKey, next)
  return next
}
