import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import type {
  BgTheme,
  BgThemeWithColor,
  ThemeColor,
  UpdateBgThemeInput,
} from "@/types/bg-theme"

const supabase = createClient()

export const THEME_COLORS_QUERY_KEY = ["theme-colors"] as const
export const MY_BG_THEME_QUERY_KEY = ["my-bg-theme"] as const

const getRequiredUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error("로그인이 필요합니다.")
  }

  return user
}

/**
 * 선택 가능한 전체 배경 테마 색상 목록 조회
 */
export const getThemeColors = async (): Promise<ThemeColor[]> => {
  const { data, error } = await supabase
    .from("theme_colors")
    .select("id, color, created_at")
    .order("id", { ascending: true })

  if (error) {
    throw error
  }

  return data
}

/**
 * 내 현재 배경 테마 조회
 * 1) user_theme_color 조회
 * 2) color_id로 theme_colors 조회
 */
export const getMyBgTheme = async (): Promise<BgThemeWithColor> => {
  const user = await getRequiredUser()

  const { data: bgTheme, error: bgThemeError } = await supabase
    .from("user_theme_color")
    .select("user_id, color_id, updated_at")
    .eq("user_id", user.id)
    .single()

  if (bgThemeError) {
    throw bgThemeError
  }

  const { data: themeColor, error: themeColorError } = await supabase
    .from("theme_colors")
    .select("id, color, created_at")
    .eq("id", bgTheme.color_id)
    .single()

  if (themeColorError) {
    throw themeColorError
  }

  return {
    user_id: bgTheme.user_id,
    color_id: bgTheme.color_id,
    updated_at: bgTheme.updated_at,
    theme_color: themeColor,
  }
}

/**
 * 내 배경 테마 색상 변경
 * user_theme_color row는 회원가입 시 미리 생성되어 있다는 전제
 */
export const updateMyBgTheme = async (
  input: UpdateBgThemeInput
): Promise<BgTheme> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("user_theme_color")
    .update({
      color_id: input.color_id,
    })
    .eq("user_id", user.id)
    .select("user_id, color_id, updated_at")
    .single()

  if (error) {
    throw error
  }

  return data
}

export const useThemeColors = () => {
  return useQuery({
    queryKey: THEME_COLORS_QUERY_KEY,
    queryFn: getThemeColors,
    staleTime: 1000 * 60 * 60,
  })
}

export const useMyBgTheme = () => {
  return useQuery({
    queryKey: MY_BG_THEME_QUERY_KEY,
    queryFn: getMyBgTheme,
    staleTime: 1000 * 60 * 60,
    retry: false,
  })
}

export const useUpdateMyBgTheme = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMyBgTheme,

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: MY_BG_THEME_QUERY_KEY,
      })

      const previousBgTheme = queryClient.getQueryData<BgThemeWithColor>(
        MY_BG_THEME_QUERY_KEY
      )

      const themeColors =
        queryClient.getQueryData<ThemeColor[]>(THEME_COLORS_QUERY_KEY) ?? []

      const selectedThemeColor =
        themeColors.find((item) => item.id === input.color_id) ?? null

      if (previousBgTheme && selectedThemeColor) {
        queryClient.setQueryData<BgThemeWithColor>(MY_BG_THEME_QUERY_KEY, {
          ...previousBgTheme,
          color_id: input.color_id,
          updated_at: new Date().toISOString(),
          theme_color: selectedThemeColor,
        })
      }

      return { previousBgTheme }
    },

    onError: (error, _variables, context) => {
      if (context?.previousBgTheme) {
        queryClient.setQueryData(MY_BG_THEME_QUERY_KEY, context.previousBgTheme)
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "배경 테마 변경에 실패했습니다."
      )
    },

    onSuccess: () => {
      toast.success("배경 테마가 변경되었어요.")
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: MY_BG_THEME_QUERY_KEY,
      })
    },
  })
}
