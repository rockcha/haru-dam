export interface TodayTask {
  id: string
  user_id: string
  date: string
  content: string
  is_done: boolean
  created_at: string
}

export interface CreateTodayTaskInput {
  date: string
  content: string
  is_done?: boolean
}

export interface UpdateTodayTaskInput {
  id: string
  date?: string
  content?: string
  is_done?: boolean
}
