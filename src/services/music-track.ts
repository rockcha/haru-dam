import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import type {
  CreateMusicTrackInput,
  MusicTrack,
  UpdateMusicTrackInput,
} from "@/types/music-track"

const supabase = createClient()

const MUSIC_TRACKS_QUERY_KEY = ["music-tracks"] as const

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

export const getMusicTracks = async (): Promise<MusicTrack[]> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("music_tracks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) {
    throw error
  }

  return data satisfies MusicTrack[]
}

export const createMusicTrack = async (
  input: CreateMusicTrackInput
): Promise<MusicTrack> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("music_tracks")
    .insert({
      user_id: user.id,
      url: input.url,
      title: input.title,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data satisfies MusicTrack
}

export const updateMusicTrack = async (
  input: UpdateMusicTrackInput
): Promise<MusicTrack> => {
  const user = await getRequiredUser()
  const { id, ...payload } = input

  const { data, error } = await supabase
    .from("music_tracks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data satisfies MusicTrack
}

export const deleteMusicTrack = async (id: string): Promise<string> => {
  const user = await getRequiredUser()

  const { error } = await supabase
    .from("music_tracks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw error
  }

  return id
}

export const useMusicTracks = () => {
  return useQuery({
    queryKey: MUSIC_TRACKS_QUERY_KEY,
    queryFn: getMusicTracks,
    staleTime: 1000 * 60 * 60,
  })
}

export const useCreateMusicTrack = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMusicTrack,
    onSuccess: (createdTrack) => {
      queryClient.invalidateQueries({
        queryKey: MUSIC_TRACKS_QUERY_KEY,
      })

      toast.success("음악이 추가되었어요.", {
        description: createdTrack.title
          ? `‘${createdTrack.title}’ 트랙을 저장했어요.`
          : "새 음악 트랙을 저장했어요.",
      })
    },
    onError: (error) => {
      toast.error("음악 추가에 실패했어요.", {
        description:
          error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      })
    },
  })
}

export const useUpdateMusicTrack = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMusicTrack,
    onSuccess: (updatedTrack) => {
      queryClient.invalidateQueries({
        queryKey: MUSIC_TRACKS_QUERY_KEY,
      })

      toast.success("음악이 수정되었어요.", {
        description: updatedTrack.title
          ? `‘${updatedTrack.title}’ 정보를 업데이트했어요.`
          : "음악 정보를 업데이트했어요.",
      })
    },
    onError: (error) => {
      toast.error("음악 수정에 실패했어요.", {
        description:
          error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      })
    },
  })
}

export const useDeleteMusicTrack = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMusicTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MUSIC_TRACKS_QUERY_KEY,
      })

      toast.success("음악이 삭제되었어요.")
    },
    onError: (error) => {
      toast.error("음악 삭제에 실패했어요.", {
        description:
          error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      })
    },
  })
}
