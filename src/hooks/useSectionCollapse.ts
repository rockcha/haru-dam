// hooks/useSectionCollapse.ts
import { useEffect, useState } from "react"
import type { SectionKey } from "@/constants/sectionDescription"

const SECTION_COLLAPSE_STORAGE_KEY = "section-collapse-state"

type SectionCollapseState = Partial<Record<SectionKey, boolean>>

const getStoredCollapseState = (): SectionCollapseState => {
  if (typeof window === "undefined") return {}

  try {
    const storedValue = localStorage.getItem(SECTION_COLLAPSE_STORAGE_KEY)
    if (!storedValue) return {}

    return JSON.parse(storedValue) as SectionCollapseState
  } catch {
    return {}
  }
}

const setStoredCollapseState = (nextState: SectionCollapseState) => {
  if (typeof window === "undefined") return

  localStorage.setItem(SECTION_COLLAPSE_STORAGE_KEY, JSON.stringify(nextState))
}

export const useSectionCollapse = (sectionKey: SectionKey) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const storedState = getStoredCollapseState()
    setIsCollapsed(storedState[sectionKey] ?? false)
    setIsReady(true)
  }, [sectionKey])

  const updateCollapsed = (nextValue: boolean) => {
    setIsCollapsed(nextValue)

    const prevState = getStoredCollapseState()
    const nextState: SectionCollapseState = {
      ...prevState,
      [sectionKey]: nextValue,
    }

    setStoredCollapseState(nextState)
  }

  const toggleCollapsed = () => {
    updateCollapsed(!isCollapsed)
  }

  return {
    isCollapsed,
    isReady,
    setIsCollapsed: updateCollapsed,
    toggleCollapsed,
  }
}
