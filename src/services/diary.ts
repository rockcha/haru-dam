import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import type { CreateDiaryInput, Diary, UpdateDiaryInput } from "@/types/diary"

const supabase = createClient()

const DIARIES_QUERY_KEY = ["diaries"] as const

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
    },
    onError: () => {
      toast.error("일기 작성에 실패했어요")
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
