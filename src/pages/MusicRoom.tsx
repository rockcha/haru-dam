import { useMemo, useState } from "react"
import { Music2, Plus, Star, Trash2 } from "lucide-react"

import { useMusicPlayer } from "@/context/MusicPlayerContext"
import {
  useCreateMusicTrack,
  useDeleteMusicTrack,
  useMusicTracks,
} from "@/services/music-track"
import {
  getYoutubeThumbnailUrl,
  isValidYoutubeUrl,
  normalizeYoutubeUrl,
} from "@/lib/youtube"
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
import { Skeleton } from "@/components/ui/skeleton"

type FormState = {
  title: string
  url: string
}

const initialForm: FormState = {
  title: "",
  url: "",
}

const MAX_TITLE_LENGTH = 40
const MAX_URL_LENGTH = 300

export default function MusicRoom() {
  const { data: tracks = [], isLoading } = useMusicTracks()
  const createTrackMutation = useCreateMusicTrack()
  const deleteTrackMutation = useDeleteMusicTrack()
  const { isPlaying, selectedTrackId, setSelectedTrackId, stopPlayback } =
    useMusicPlayer()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)

  const createDisabled = useMemo(() => {
    const trimmedTitle = form.title.trim()
    const normalizedUrl = normalizeYoutubeUrl(form.url)

    return (
      !trimmedTitle ||
      !normalizedUrl ||
      !isValidYoutubeUrl(normalizedUrl) ||
      createTrackMutation.isPending
    )
  }, [createTrackMutation.isPending, form.title, form.url])

  const handleCreate = async () => {
    const trimmedTitle = form.title.trim()
    const normalizedUrl = normalizeYoutubeUrl(form.url)

    if (!trimmedTitle || !normalizedUrl || !isValidYoutubeUrl(normalizedUrl)) {
      return
    }

    await createTrackMutation.mutateAsync({
      title: trimmedTitle,
      url: normalizedUrl,
    })

    setForm(initialForm)
    setIsCreateDialogOpen(false)
  }

  const handleDelete = async (trackId: string) => {
    const confirmed = window.confirm("이 음악을 삭제할까요?")
    if (!confirmed) return

    if (selectedTrackId === trackId) {
      stopPlayback()
      setSelectedTrackId("")
    }

    await deleteTrackMutation.mutateAsync(trackId)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-6">
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-bold text-emerald-700">
              나의 뮤직룸
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              카드를 클릭해서 즐겨찾기로 지정하면, 헤더 버튼으로 바로 재생할 수
              있어요.
            </p>
          </div>

          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            새로운 음악 추가
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-600/60 bg-emerald-50/60 px-4 text-center">
              <Music2 className="mb-3 h-10 w-10 text-emerald-600" />
              <p className="text-lg font-semibold text-emerald-900">
                아직 저장한 음악이 없어요.
              </p>
              <p className="mt-1 text-sm text-emerald-900/70">
                좋아하는 유튜브 음악을 뮤직룸에 모아보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {tracks.map((track) => {
                const isActive = track.id === selectedTrackId
                const thumbnailUrl = getYoutubeThumbnailUrl(track.url)

                return (
                  <Card
                    key={track.id}
                    className={
                      isActive
                        ? "overflow-hidden border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_8px_24px_rgba(16,185,129,0.12)]"
                        : "overflow-hidden border-black/5"
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          stopPlayback()
                          setSelectedTrackId("")
                        } else {
                          stopPlayback()
                          setSelectedTrackId(track.id)
                        }
                      }}
                      className="w-full cursor-pointer text-left transition hover:bg-emerald-50/40"
                    >
                      <div className="relative aspect-video overflow-hidden bg-emerald-50">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={track.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            썸네일 없음
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                            <Star className="h-3 w-3 fill-white" />
                            즐겨찾기
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <p className="line-clamp-2 min-h-12 text-sm leading-6 font-semibold text-slate-900">
                          {track.title}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          {isActive
                            ? isPlaying
                              ? "헤더에서 재생 중 ▶"
                              : "즐겨찾기로 지정됨 ★"
                            : "클릭하면 즐겨찾기로 지정돼요"}
                        </p>
                      </div>
                    </button>

                    <CardContent className="pt-0">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => void handleDelete(track.id)}
                        disabled={deleteTrackMutation.isPending}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        삭제하기
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 음악 추가</DialogTitle>
            <DialogDescription>
              유튜브 링크와 제목을 저장하면 뮤직룸 카드에 보관돼요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="music-title">제목</Label>
              <Input
                id="music-title"
                value={form.title}
                maxLength={MAX_TITLE_LENGTH}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    title: event.target.value.slice(0, MAX_TITLE_LENGTH),
                  }))
                }
                placeholder="예: 오늘 밤에 듣고 싶은 노래"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="music-url">유튜브 링크</Label>
              <Input
                id="music-url"
                value={form.url}
                maxLength={MAX_URL_LENGTH}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    url: event.target.value.slice(0, MAX_URL_LENGTH),
                  }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {form.url && !isValidYoutubeUrl(form.url) ? (
                <p className="text-xs text-red-500">
                  유효한 유튜브 링크를 입력해주세요.
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setForm(initialForm)
                setIsCreateDialogOpen(false)
              }}
            >
              취소
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => void handleCreate()}
              disabled={createDisabled}
            >
              {createTrackMutation.isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
