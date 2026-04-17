import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import { GOLD_QUERY_KEY } from "@/services/gold"

const supabase = createClient()

export const BAIT_QUERY_KEY = ["bait"] as const

type BuyBaitResult = {
  result_user_id: string
  purchased_quantity: number
  spent_gold: number
  remaining_gold: number
  total_bait_count: number
}

const getRequiredUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw new Error(error.message)
  if (!user) throw new Error("로그인이 필요합니다.")

  return user
}

export async function fetchMyBaitCount(): Promise<number> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("user_bait_inventory")
    .select("bait_count")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return data?.bait_count ?? 0
}

export async function buyBait(quantity: number): Promise<BuyBaitResult> {
  const { data, error } = await supabase.rpc("buy_bait", {
    p_quantity: quantity,
  })

  if (error) throw new Error(error.message)

  const result = Array.isArray(data) ? data[0] : data

  if (!result) {
    throw new Error("미끼 구매 결과를 확인할 수 없어요.")
  }

  return result as BuyBaitResult
}

export function useMyBaitCount() {
  return useQuery({
    queryKey: BAIT_QUERY_KEY,
    queryFn: fetchMyBaitCount,
  })
}

export function useBuyBait() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: buyBait,
    onSuccess: async (result) => {
      toast.success(
        `미끼 ${result.purchased_quantity}개를 구매했어요. ${result.spent_gold}골드를 사용했습니다.`
      )

      queryClient.setQueryData(BAIT_QUERY_KEY, result.total_bait_count)

      await queryClient.invalidateQueries({ queryKey: BAIT_QUERY_KEY })
      await queryClient.invalidateQueries({ queryKey: GOLD_QUERY_KEY })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "미끼 구매에 실패했어요."
      toast.error(message)
    },
  })
}
