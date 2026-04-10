import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import type { CreateDiaryInput, Diary, UpdateDiaryInput } from "@/types/diary"

const supabase = createClient()

const DIARIES_QUERY_KEY = ["diaries"] as const
const GOLD_QUERY_KEY = ["gold"] as const

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

export const fetchDiaries = async (): Promise<Diary[]> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []) as Diary[]
}

export const fetchDiaryById = async (id: string): Promise<Diary> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) throw error

  return data as Diary
}

export const createDiary = async (input: CreateDiaryInput): Promise<Diary> => {
  const user = await getRequiredUser()
  const isTodayInSeoul = input.date === getSeoulDateString()

  if (isTodayInSeoul) {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_diary_and_give_gold",
      {
        p_title: input.title,
        p_emotion: input.emotion,
        p_content: input.content,
        p_date: input.date,
      }
    )

    if (rpcError) throw rpcError

    const result = rpcData as {
      success: boolean
      message: string
      diary_id?: string
      gold_reward?: number
    } | null

    if (!result?.success) {
      throw new Error(result?.message ?? "일기 작성에 실패했어요")
    }

    if (!result.diary_id) {
      throw new Error("작성된 일기 정보를 확인할 수 없어요")
    }

    const { data: diaryData, error: diaryError } = await supabase
      .from("diaries")
      .select("*")
      .eq("id", result.diary_id)
      .eq("user_id", user.id)
      .single()

    if (diaryError) throw diaryError

    return diaryData as Diary
  }

  const { data, error } = await supabase
    .from("diaries")
    .insert({
      user_id: user.id,
      date: input.date,
      title: input.title,
      emotion: input.emotion,
      content: input.content,
    })
    .select()
    .single()

  if (error) throw error

  return data as Diary
}

export const updateDiary = async ({
  id,
  payload,
}: UpdateDiaryInput): Promise<Diary> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("diaries")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  return data as Diary
}

export const deleteDiary = async (id: string): Promise<string> => {
  const user = await getRequiredUser()

  const { error } = await supabase
    .from("diaries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error

  return id
}

export const useDiaries = () => {
  return useQuery({
    queryKey: DIARIES_QUERY_KEY,
    queryFn: fetchDiaries,
  })
}

export const useDiary = (id: string) => {
  return useQuery({
    queryKey: [...DIARIES_QUERY_KEY, id],
    queryFn: () => fetchDiaryById(id),
    enabled: !!id,
  })
}

export const useCreateDiary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDiary,
    onSuccess: () => {
      toast.success("일기가 작성되었어요")
      queryClient.invalidateQueries({ queryKey: DIARIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOLD_QUERY_KEY })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "일기 작성에 실패했어요"
      toast.error(message)
    },
  })
}

export const useUpdateDiary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDiary,
    onSuccess: (_updated, variables) => {
      toast.success("일기가 수정되었어요")
      queryClient.invalidateQueries({ queryKey: DIARIES_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...DIARIES_QUERY_KEY, variables.id],
      })
    },
    onError: () => {
      toast.error("일기 수정에 실패했어요")
    },
  })
}

export const useDeleteDiary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDiary,
    onSuccess: () => {
      toast.success("일기가 삭제되었어요")
      queryClient.invalidateQueries({ queryKey: DIARIES_QUERY_KEY })
    },
    onError: () => {
      toast.error("일기 삭제에 실패했어요")
    },
  })
}
