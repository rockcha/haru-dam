import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createClient } from "@/lib/client"

const supabase = createClient()

export const GOLD_QUERY_KEY = ["gold"] as const
export const TODAY_ATTENDANCE_QUERY_KEY = ["attendance", "today"] as const

const getSeoulDateString = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const parts = formatter.formatToParts(new Date())
  const year = parts.find((part) => part.type === "year")?.value ?? ""
  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const day = parts.find((part) => part.type === "day")?.value ?? ""

  return `${year}-${month}-${day}`
}

const getRequiredUser = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error("로그인이 필요합니다.")

  return user
}

type RpcResult = {
  success: boolean
  message: string
  gold_reward?: number
}

export const fetchMyGold = async (): Promise<number> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("gold")
    .select("amount")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) throw error

  return data?.amount ?? 0
}

export const fetchTodayAttendance = async (): Promise<boolean> => {
  const user = await getRequiredUser()
  const today = getSeoulDateString()

  const { data, error } = await supabase
    .from("attendance")
    .select("attendance_date")
    .eq("user_id", user.id)
    .eq("attendance_date", today)
    .maybeSingle()

  if (error) throw error

  return Boolean(data)
}

export const checkAttendanceAndGiveGold = async (): Promise<RpcResult> => {
  const { data, error } = await supabase.rpc("check_attendance_and_give_gold")

  if (error) throw error

  const result = data as RpcResult | null

  if (!result) {
    throw new Error("출석 처리 결과를 확인할 수 없어요.")
  }

  return result
}

export const useMyGold = (enabled = true) => {
  return useQuery({
    queryKey: GOLD_QUERY_KEY,
    queryFn: fetchMyGold,
    enabled,
  })
}

export const useTodayAttendance = (enabled = true) => {
  return useQuery({
    queryKey: TODAY_ATTENDANCE_QUERY_KEY,
    queryFn: fetchTodayAttendance,
    enabled,
  })
}

export const useCheckAttendanceAndGiveGold = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: checkAttendanceAndGiveGold,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(`✅ ${result.message}`)
      } else {
        toast.info(`⛔ ${result.message}`)
      }

      await queryClient.invalidateQueries({
        queryKey: TODAY_ATTENDANCE_QUERY_KEY,
      })
      await queryClient.invalidateQueries({ queryKey: GOLD_QUERY_KEY })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "출석 처리에 실패했어요"
      toast.error(`⚠️ ${message}`)
    },
  })
}
