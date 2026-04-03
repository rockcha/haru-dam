import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import type { CreateMemoInput, Memo } from "@/types/memo"

const supabase = createClient()

const MEMOS_QUERY_KEY = ["memos"] as const

type UpdateMemoPayload = {
  id: string
  payload: {
    content?: string
  }
}

const getRequiredUser = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    throw new Error("로그인이 필요합니다.")
  }

  return user
}

export const getMemos = async (): Promise<Memo[]> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("memos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return data satisfies Memo[]
}

export const createMemo = async (input: CreateMemoInput): Promise<Memo> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("memos")
    .insert({
      user_id: user.id,
      content: input.content,
    })
    .select()
    .single()

  if (error) throw error

  return data satisfies Memo
}

export const updateMemo = async ({
  id,
  payload,
}: UpdateMemoPayload): Promise<Memo> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("memos")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  return data satisfies Memo
}

export const deleteMemo = async (id: string): Promise<string> => {
  const user = await getRequiredUser()

  const { error } = await supabase
    .from("memos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error

  return id
}

export const useMemos = () => {
  return useQuery({
    queryKey: MEMOS_QUERY_KEY,
    queryFn: getMemos,
    staleTime: 1000 * 60 * 60,
  })
}

export const useCreateMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMemo,
    onSuccess: () => {
      toast.success("메모가 추가되었어요")
      queryClient.invalidateQueries({
        queryKey: MEMOS_QUERY_KEY,
      })
    },
    onError: () => {
      toast.error("메모 추가에 실패했어요")
    },
  })
}

export const useUpdateMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMemo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEMOS_QUERY_KEY,
      })
    },
    onError: () => {
      toast.error("메모 수정에 실패했어요")
    },
  })
}

export const useDeleteMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMemo,
    onSuccess: () => {
      toast.success("메모가 삭제되었어요")
      queryClient.invalidateQueries({
        queryKey: MEMOS_QUERY_KEY,
      })
    },
    onError: () => {
      toast.error("메모 삭제에 실패했어요")
    },
  })
}
