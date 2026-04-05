import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import type {
  Schedule,
  CreateScheduleInput,
  UpdateScheduleInput,
} from "@/types/schedule"
import { normalizeScheduleTime } from "@/types/schedule"

const supabase = createClient()

// ============= API Functions =============

/**
 * 모든 일정 조회
 */
export async function fetchSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * 특정 일정 조회
 */
export async function fetchScheduleById(id: string): Promise<Schedule> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * 날짜로 일정 조회
 */
export async function fetchSchedulesByDate(date: string): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("date", date)
    .order("time", { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * 일정 추가
 */
export async function createSchedule(
  input: CreateScheduleInput
): Promise<Schedule> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("사용자 정보를 찾을 수 없습니다")

  const normalizedTime = normalizeScheduleTime(input.time)

  const { data, error } = await supabase
    .from("schedules")
    .insert([
      {
        user_id: user.id,
        title: input.title,
        date: input.date,
        time: normalizedTime,
        memo: input.memo || null,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * 일정 수정
 */
export async function updateSchedule(
  input: UpdateScheduleInput
): Promise<Schedule> {
  const { id, ...updateData } = input

  const updatePayload: any = {}

  if (updateData.title !== undefined) updatePayload.title = updateData.title
  if (updateData.date !== undefined) updatePayload.date = updateData.date
  if (updateData.time !== undefined)
    updatePayload.time = normalizeScheduleTime(updateData.time)
  if (updateData.memo !== undefined) updatePayload.memo = updateData.memo

  const { data, error } = await supabase
    .from("schedules")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * 일정 삭제
 */
export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabase.from("schedules").delete().eq("id", id)

  if (error) throw new Error(error.message)
}

// ============= React Query Hooks =============

/**
 * 모든 일정 조회 훅
 */
export function useSchedules(options?: {
  refetchInterval?: number | false
  refetchIntervalInBackground?: boolean
}) {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules,
    staleTime: 1000 * 60 * 60,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground,
  })
}

/**
 * 특정 일정 조회 훅
 */
export function useSchedule(id: string) {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => fetchScheduleById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  })
}

/**
 * 날짜로 일정 조회 훅
 */
export function useSchedulesByDate(date: string) {
  return useQuery({
    queryKey: ["schedules", { date }],
    queryFn: () => fetchSchedulesByDate(date),
    enabled: !!date,
  })
}

/**
 * 일정 추가 훅
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      // 모든 schedule 관련 쿼리를 한 번에 무효화
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
        exact: false,
      })
      toast.success("일정이 추가되었습니다")
    },
    onError: (error: any) => {
      toast.error(error.message || "일정 추가에 실패했습니다")
    },
  })
}

/**
 * 일정 수정 훅
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
        exact: false,
      })
      toast.success("일정이 수정되었습니다")
    },
    onError: (error: any) => {
      toast.error(error.message || "일정 수정에 실패했습니다")
    },
  })
}

/**
 * 일정 삭제 훅
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
        exact: false,
      })
      toast.success("일정이 삭제되었습니다")
    },
    onError: (error: any) => {
      toast.error(error.message || "일정 삭제에 실패했습니다")
    },
  })
}
