export interface DeveloperNote {
  id: string
  title: string
  content: string
  pinned: boolean
  created_at: string
  updated_at: string
}

export type DeveloperNotes = DeveloperNote[]
