import type { ScheduleType } from "@/constants/scheduleType"

export interface Schedule {
  id: string
  user_id: string
  title: string
  date: string
  time: string
  type: ScheduleType | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface CreateScheduleInput {
  title: string
  date: string
  type: ScheduleType
  time?: string
  memo?: string
}

export interface UpdateScheduleInput {
  id: string
  title?: string
  date?: string
  type?: ScheduleType
  time?: string
  memo?: string
}

export const DEFAULT_SCHEDULE_TIME = "23:59:59"

export const normalizeScheduleTime = (time?: string) => {
  if (!time || time.trim() === "") return DEFAULT_SCHEDULE_TIME
  return time.length === 5 ? `${time}:00` : time
}
