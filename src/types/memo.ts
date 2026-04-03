export interface Memo {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface CreateMemoInput {
  content: string
}
