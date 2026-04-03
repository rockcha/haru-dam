import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/client"

const supabase = createClient()

/**
 * API 요청 함수
 * @example
 * const { data } = useQuery({
 *   queryKey: ['posts'],
 *   queryFn: () => queryFn(['posts'], (table) => table.select())
 * })
 */
export function queryFn(
  _queryKey: string[],
  fn: (client: ReturnType<typeof createClient>) => Promise<any>
) {
  return fn(supabase)
}

/**
 * Supabase 데이터 조회
 * @example
 * const { data, isPending } = useSupabaseQuery(
 *   ['posts'],
 *   () => supabase.from('posts').select('*')
 * )
 */
export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<any>
) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await queryFn()
      if (error) throw error
      return data as T
    },
  })
}

/**
 * Supabase 데이터 생성/수정/삭제
 * @example
 * const { mutate } = useSupabaseMutation(
 *   (newData) => supabase.from('posts').insert(newData),
 *   { invalidateQueries: ['posts'] }
 * )
 */
export function useSupabaseMutation<TData, TError>(
  mutationFn: (data: TData) => Promise<any>,
  options?: {
    invalidateQueries?: string[]
    onSuccess?: (data: any) => void
    onError?: (error: TError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TData) => {
      const { data: result, error } = await mutationFn(data)
      if (error) throw error
      return result
    },
    onSuccess: async (data) => {
      if (options?.invalidateQueries) {
        for (const key of options.invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: [key] })
        }
      }
      options?.onSuccess?.(data)
    },
    onError: (error: any) => {
      options?.onError?.(error)
    },
  })
}
