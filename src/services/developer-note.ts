import { useQuery } from "@tanstack/react-query"

import { createClient } from "@/lib/client"
import type { DeveloperNote } from "@/types/developer-note"

const supabase = createClient()

export const DEVELOPER_NOTES_QUERY_KEY = ["developer-notes"] as const

/**
 * 개발자 노트 전체 조회
 * pinned 먼저, 그 다음 created_at 최신순
 */
export const getDeveloperNotes = async (): Promise<DeveloperNote[]> => {
  const { data, error } = await supabase
    .from("developer_notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data satisfies DeveloperNote[]
}

/**
 * 개발자 노트 조회 React Query 훅
 */
export const useDeveloperNotes = () => {
  return useQuery({
    queryKey: DEVELOPER_NOTES_QUERY_KEY,
    queryFn: getDeveloperNotes,
  })
}
