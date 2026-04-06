export const DIARY_EMOTIONS = [1, 2, 3, 4, 5] as const

export type DiaryEmotion = (typeof DIARY_EMOTIONS)[number]

export interface Diary {
  id: string
  user_id: string
  date: string
  title: string
  emotion: DiaryEmotion
  content: string
  created_at: string
  updated_at: string
}

export interface CreateDiaryInput {
  date: string
  title: string
  emotion: DiaryEmotion
  content: string
}

export interface UpdateDiaryInput {
  id: string
  payload: {
    date?: string
    title?: string
    emotion?: DiaryEmotion
    content?: string
  }
}
