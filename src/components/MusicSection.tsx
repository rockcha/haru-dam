"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import {
  useCreateMusicTrack,
  useDeleteMusicTrack,
  useMusicTracks,
  useUpdateMusicTrack,
} from "@/services/music-track"
import { SECTION_DESCRIPTIONS } from "@/constants/sectionDescription"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useSectionCollapse } from "@/hooks/useSectionCollapse"

type FormState = {
  title: string
  url: string
}

type YouTubePlayer = {
  destroy: () => void
  playVideo: () => void
  pauseVideo: () => void
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: () => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YouTubePlayer
      PlayerState: {
        UNSTARTED: -1
        ENDED: 0
        PLAYING: 1
        PAUSED: 2
        BUFFERING: 3
        CUED: 5
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

const initialForm: FormState = {
  title: "",
  url: "",
}

const MAX_TITLE_LENGTH = 20
const MAX_URL_LENGTH = 300
const PLAYER_ELEMENT_ID = "music-youtube-player"

const normalizeYoutubeUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const isValidYoutubeUrl = (url: string) => {
  try {
    const parsed = new URL(normalizeYoutubeUrl(url))
    const host = parsed.hostname.replace("www.", "")

    return (
      host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com"
    )
  } catch {
    return false
  }
}

const getYoutubeVideoId = (url: string) => {
  try {
    const parsed = new URL(normalizeYoutubeUrl(url))
    const host = parsed.hostname.replace("www.", "")

    if (host === "youtu.be") {
      return parsed.pathname.replace("/", "")
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v") ?? ""
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1] ?? ""
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1] ?? ""
      }
    }

    return ""
  } catch {
    return ""
  }
}

const loadYouTubeIframeApi = () => {
  return new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    )

    if (!existingScript) {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.body.appendChild(script)
    }

    const previous = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
  })
}

export default function MusicSection() {
  const { user } = useAuth()

  const { isCollapsed, toggleCollapsed } = useSectionCollapse("music")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [form, setForm] = useState<FormState>(initialForm)
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [selectedTrackId, setSelectedTrackId] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)

  const playerRef = useRef<YouTubePlayer | null>(null)

  const { data: tracks = [], isLoading } = useMusicTracks()
  const createMutation = useCreateMusicTrack()
  const updateMutation = useUpdateMusicTrack()
  const deleteMutation = useDeleteMusicTrack()

  useEffect(() => {
    if (!tracks.length) {
      setSelectedTrackId("")
      return
    }

    const hasSelected = tracks.some((track) => track.id === selectedTrackId)

    if (!hasSelected) {
      setSelectedTrackId(tracks[0].id)
    }
  }, [tracks, selectedTrackId])

  const selectedTrack = useMemo(() => {
    return tracks.find((track) => track.id === selectedTrackId) ?? null
  }, [tracks, selectedTrackId])

  const selectedVideoId = selectedTrack
    ? getYoutubeVideoId(selectedTrack.url)
    : ""
  const badgeCount = tracks.length

  const handleChangeForm = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]:
        key === "title"
          ? value.slice(0, MAX_TITLE_LENGTH)
          : value.slice(0, MAX_URL_LENGTH),
    }))
  }

  const openCreateDialog = () => {
    setForm(initialForm)
    setIsCreateOpen(true)
  }

  const openEditDialog = () => {
    if (!selectedTrack) return

    setEditingTrackId(selectedTrack.id)
    setForm({
      title: selectedTrack.title,
      url: selectedTrack.url,
    })
    setIsEditOpen(true)
  }

  const closeEditDialog = () => {
    setEditingTrackId(null)
    setForm(initialForm)
    setIsEditOpen(false)
  }

  const handleCreate = async () => {
    if (!user) return

    const trimmedTitle = form.title.trim()
    const normalizedUrl = normalizeYoutubeUrl(form.url)

    if (!trimmedTitle || !normalizedUrl) return
    if (!isValidYoutubeUrl(normalizedUrl)) return

    const createdTrack = await createMutation.mutateAsync({
      title: trimmedTitle,
      url: normalizedUrl,
    })

    setSelectedTrackId(createdTrack.id)
    setForm(initialForm)
    setIsCreateOpen(false)
  }

  const handleEdit = async () => {
    const trimmedTitle = form.title.trim()
    const normalizedUrl = normalizeYoutubeUrl(form.url)

    if (!editingTrackId || !trimmedTitle || !normalizedUrl) return
    if (!isValidYoutubeUrl(normalizedUrl)) return

    const updatedTrack = await updateMutation.mutateAsync({
      id: editingTrackId,
      title: trimmedTitle,
      url: normalizedUrl,
    })

    setSelectedTrackId(updatedTrack.id)
    closeEditDialog()
  }

  const handleDelete = async () => {
    if (!selectedTrack) return
    await deleteMutation.mutateAsync(selectedTrack.id)
  }

  const titleError = form.title.trim().length === 0
  const urlError =
    form.url.trim().length > 0 &&
    !isValidYoutubeUrl(normalizeYoutubeUrl(form.url))

  const submitDisabled =
    !user ||
    titleError ||
    !form.url.trim() ||
    urlError ||
    createMutation.isPending ||
    updateMutation.isPending

  useEffect(() => {
    if (!selectedVideoId) {
      setIsPlaying(false)
      playerRef.current?.destroy?.()
      playerRef.current = null
      return
    }

    let isMounted = true

    const initPlayer = async () => {
      await loadYouTubeIframeApi()
      if (!isMounted || !window.YT?.Player) return

      playerRef.current?.destroy?.()
      setIsPlaying(false)

      playerRef.current = new window.YT.Player(PLAYER_ELEMENT_ID, {
        videoId: selectedVideoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onStateChange: (event) => {
            const state = event.data

            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              return
            }

            if (
              state === window.YT.PlayerState.PAUSED ||
              state === window.YT.PlayerState.ENDED ||
              state === window.YT.PlayerState.BUFFERING ||
              state === window.YT.PlayerState.CUED
            ) {
              setIsPlaying(false)
            }
          },
        },
      })
    }

    initPlayer()

    return () => {
      isMounted = false
    }
  }, [selectedVideoId])

  useEffect(() => {
    return () => {
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card
        className={cn(
          "relative shadow-sm",
          isPlaying
            ? "animate-music-glow shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_0_18px_rgba(16,185,129,0.22),0_0_40px_rgba(16,185,129,0.18)]"
            : "border-border shadow-sm"
        )}
      >
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer">🎧 음악</span>
                    </TooltipTrigger>

                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="max-w-xs"
                    >
                      <p>{SECTION_DESCRIPTIONS.music}</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>

                {isCollapsed && (
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                    {badgeCount}+
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                유튜브 링크를 저장하고 원하는 곡을 골라 재생해보세요
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? "음악 펼치기" : "음악 접기"}
              className="absolute top-2 right-2 shrink-0 rounded-full"
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent
          className={cn(
            "space-y-4 overflow-hidden transition-all duration-300",
            isCollapsed
              ? "max-h-0 px-0 py-0 opacity-0"
              : "max-h-[1200px] opacity-100"
          )}
        >
          <div
            className={cn(
              "space-y-4 transition-all duration-300",
              isCollapsed && "pointer-events-none h-0 overflow-hidden opacity-0"
            )}
          >
            {!user ? (
              <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                  로그인 후 음악 기능을 사용할 수 있어요 🔐
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="w-full p-2 md:flex-1">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>

                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white p-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                </div>
              </div>
            ) : tracks.length === 0 ? (
              <div className="space-y-3">
                <div className="flex min-h-64 items-center justify-center rounded-xl border-2 border-dashed border-emerald-600/80 bg-emerald-50/70 px-4">
                  <p className="text-center text-lg font-medium text-emerald-900/70">
                    여기엔 아무것도 없네요..🥲
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-1 h-4 w-4" />
                    음악 추가
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="w-full p-2 md:flex-1">
                    <NativeSelect
                      value={selectedTrackId}
                      onChange={(e) => setSelectedTrackId(e.target.value)}
                      aria-label="재생할 음악 선택"
                    >
                      {tracks.map((track) => (
                        <NativeSelectOption key={track.id} value={track.id}>
                          {track.title}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" onClick={openCreateDialog}>
                      <Plus className="mr-1 h-4 w-4" />
                      음악 추가
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={openEditDialog}
                      disabled={!selectedTrack}
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      수정
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={!selectedTrack || deleteMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                </div>

                {selectedTrack && selectedVideoId ? (
                  <div
                    className={cn("rounded-2xl transition-all duration-500")}
                  >
                    <div
                      className={cn(
                        "overflow-hidden rounded-2xl border bg-black transition-all duration-500",
                        isPlaying ? "border-emerald-200" : "border-emerald-100"
                      )}
                    >
                      <div className="aspect-video w-full">
                        <div id={PLAYER_ELEMENT_ID} className="h-full w-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                    <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                      올바른 유튜브 링크를 선택해주세요 🎧
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎧 음악 추가</DialogTitle>
            <DialogDescription>
              유튜브 링크와 제목을 등록해 원하는 음악을 저장해보세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="music-title">제목</Label>
              <Input
                id="music-title"
                maxLength={MAX_TITLE_LENGTH}
                value={form.title}
                onChange={(e) => handleChangeForm("title", e.target.value)}
                placeholder="예: 공부할 때 듣는 음악"
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.title.length}/{MAX_TITLE_LENGTH}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="music-url">유튜브 링크</Label>
              <Input
                id="music-url"
                maxLength={MAX_URL_LENGTH}
                value={form.url}
                onChange={(e) => handleChangeForm("url", e.target.value)}
                placeholder="예: https://www.youtube.com/watch?v=BXDSOP-Wn5c"
              />
              {urlError && (
                <p className="text-xs text-red-500">
                  올바른 유튜브 링크 형식으로 입력해주세요
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={submitDisabled}>
              {createMutation.isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>음악 수정</DialogTitle>
            <DialogDescription>
              제목과 유튜브 링크를 원하는 값으로 변경해보세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-music-title">제목</Label>
              <Input
                id="edit-music-title"
                maxLength={MAX_TITLE_LENGTH}
                value={form.title}
                onChange={(e) => handleChangeForm("title", e.target.value)}
                placeholder="예: 공부할 때 듣는 음악"
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.title.length}/{MAX_TITLE_LENGTH}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-music-url">유튜브 링크</Label>
              <Input
                id="edit-music-url"
                maxLength={MAX_URL_LENGTH}
                value={form.url}
                onChange={(e) => handleChangeForm("url", e.target.value)}
                placeholder="예: https://www.youtube.com/watch?v=BXDSOP-Wn5c"
              />
              {urlError && (
                <p className="text-xs text-red-500">
                  올바른 유튜브 링크 형식으로 입력해주세요
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              취소
            </Button>
            <Button onClick={handleEdit} disabled={submitDisabled}>
              {updateMutation.isPending ? "수정 중..." : "수정하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
