import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/client"
import type {
  Bookmark,
  BookmarkType,
  BookmarkWithType,
  CreateBookmarkInput,
  CreateBookmarkTypeInput,
  UpdateBookmarkInput,
  UpdateBookmarkTypeInput,
} from "@/types/bookmarks"

const supabase = createClient()

export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  lists: () => [...bookmarkKeys.all, "list"] as const,
  withType: () => [...bookmarkKeys.all, "with-type"] as const,
  types: () => [...bookmarkKeys.all, "types"] as const,
}

const getRequiredUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error("로그인이 필요합니다.")

  return user
}

/* =========================
   Bookmark Types API
========================= */

export const getBookmarkTypes = async (): Promise<BookmarkType[]> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("bookmark_types")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data ?? []
}

export const createBookmarkType = async (
  input: CreateBookmarkTypeInput
): Promise<BookmarkType> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("bookmark_types")
    .insert({
      user_id: user.id,
      name: input.name,
      color: input.color ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateBookmarkType = async (
  input: UpdateBookmarkTypeInput
): Promise<BookmarkType> => {
  const user = await getRequiredUser()
  const { id, ...rest } = input

  const updateData: Partial<BookmarkType> = {}

  if (rest.name !== undefined) updateData.name = rest.name
  if (rest.color !== undefined) updateData.color = rest.color

  const { data, error } = await supabase
    .from("bookmark_types")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteBookmarkType = async (id: string): Promise<void> => {
  const user = await getRequiredUser()

  const { error: bookmarksDeleteError } = await supabase
    .from("bookmarks")
    .delete()
    .eq("type_id", id)
    .eq("user_id", user.id)

  if (bookmarksDeleteError) throw bookmarksDeleteError

  const { error } = await supabase
    .from("bookmark_types")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error
}

/* =========================
   Bookmarks API
========================= */

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export const getBookmarksWithType = async (): Promise<BookmarkWithType[]> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      `
      *,
      bookmark_type:bookmark_types(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as BookmarkWithType[]
}

export const createBookmark = async (
  input: CreateBookmarkInput
): Promise<Bookmark> => {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: user.id,
      type_id: input.type_id,
      title: input.title,
      url: input.url,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateBookmark = async (
  input: UpdateBookmarkInput
): Promise<Bookmark> => {
  const user = await getRequiredUser()
  const { id, ...rest } = input

  const updateData: Partial<Bookmark> = {}

  if (rest.title !== undefined) updateData.title = rest.title
  if (rest.url !== undefined) updateData.url = rest.url
  if (rest.type_id !== undefined) updateData.type_id = rest.type_id

  const { data, error } = await supabase
    .from("bookmarks")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteBookmark = async (id: string): Promise<void> => {
  const user = await getRequiredUser()

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error
}

/* =========================
   Bookmark Types Query Hooks
========================= */

export const useBookmarkTypes = () => {
  return useQuery({
    queryKey: bookmarkKeys.types(),
    queryFn: getBookmarkTypes,
    staleTime: 1000 * 60 * 60,
  })
}

export const useCreateBookmarkType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBookmarkType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.types() })
    },
  })
}

export const useUpdateBookmarkType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBookmarkType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.types() })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.withType() })
    },
  })
}

export const useDeleteBookmarkType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBookmarkType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.types() })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.withType() })
    },
  })
}

/* =========================
   Bookmarks Query Hooks
========================= */

export const useBookmarks = () => {
  return useQuery({
    queryKey: bookmarkKeys.lists(),
    queryFn: getBookmarks,
    staleTime: 1000 * 60 * 60,
  })
}

export const useBookmarksWithType = () => {
  return useQuery({
    queryKey: bookmarkKeys.withType(),
    queryFn: getBookmarksWithType,
    staleTime: 1000 * 60 * 60,
  })
}

export const useCreateBookmark = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.withType() })
    },
  })
}

export const useUpdateBookmark = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.withType() })
    },
  })
}

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.withType() })
    },
  })
}
