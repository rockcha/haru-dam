import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { ChevronRight, Plus } from "lucide-react"

import { useDiaries } from "@/services/diary"
import type { DiaryEmotion } from "@/types/diary"
import { DIARY_EMOTION_BG_CLASS } from "@/constants/diaryEmotion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const DIARY_VIEW_MODE_STORAGE_KEY = "diary-view-mode"

function EmotionImage({
  emotion,
  title,
}: {
  emotion: DiaryEmotion
  title: string
}) {
  return (
    <img
      src={`/emotions/emotion${emotion}.png`}
      alt={`${title} 감정 ${emotion}`}
      className="h-full w-full object-cover"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = "none"
      }}
    />
  )
}

export default function Diaries() {
  const navigate = useNavigate()
  const { data: diaries = [], isLoading } = useDiaries()
  const [isEditRedirectDialogOpen, setIsEditRedirectDialogOpen] =
    useState(false)
  const [isDateSelectDialogOpen, setIsDateSelectDialogOpen] = useState(false)
  const [todayDiaryId, setTodayDiaryId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isDetailedView, setIsDetailedView] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return localStorage.getItem(DIARY_VIEW_MODE_STORAGE_KEY) === "detailed"
  })

  useEffect(() => {
    localStorage.setItem(
      DIARY_VIEW_MODE_STORAGE_KEY,
      isDetailedView ? "detailed" : "preview"
    )
  }, [isDetailedView])

  const handleCreateClick = () => {
    setSelectedDate(new Date())
    setIsDateSelectDialogOpen(true)
  }

  const handleDateSelect = () => {
    if (!selectedDate) return

    const dateString = format(selectedDate, "yyyy-MM-dd")
    const existedDiary = diaries.find((diary) => diary.date === dateString)

    if (!existedDiary) {
      navigate(`/diary/new?date=${dateString}`)
      setIsDateSelectDialogOpen(false)
      return
    }

    setTodayDiaryId(existedDiary.id)
    setIsDateSelectDialogOpen(false)
    setIsEditRedirectDialogOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-6">
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-emerald-700">
            나의 일기 꾸러미
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-emerald-900">
              <span
                className={
                  isDetailedView ? "text-emerald-500/70" : "font-semibold"
                }
              >
                미리보기
              </span>
              <Switch
                checked={isDetailedView}
                onCheckedChange={setIsDetailedView}
                aria-label="일기 보기 모드 전환"
              />
              <span
                className={
                  isDetailedView ? "font-semibold" : "text-emerald-500/70"
                }
              >
                자세히 보기
              </span>
            </div>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleCreateClick}
            >
              <Plus className="mr-1 h-4 w-4" />
              일기 작성
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div
              className={
                isDetailedView
                  ? "grid gap-4 md:grid-cols-2"
                  : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              }
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={
                    isDetailedView
                      ? "space-y-3 rounded-lg border p-4"
                      : "space-y-2 rounded-lg border p-2"
                  }
                >
                  <Skeleton
                    className={
                      isDetailedView
                        ? "h-40 w-full rounded-lg"
                        : "aspect-4/3 w-full rounded-md"
                    }
                  />
                  <Skeleton className="h-4 w-3/4" />
                  {isDetailedView ? (
                    <Skeleton className="h-16 w-full rounded-xl" />
                  ) : null}
                </div>
              ))}
            </div>
          ) : diaries.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center rounded-xl border-2 border-dashed border-emerald-600/70 bg-emerald-50/70 px-4">
              <p className="text-center text-lg font-medium text-emerald-900/80">
                아직 작성한 일기가 없어요. 첫 일기를 남겨보세요.
              </p>
            </div>
          ) : (
            <div
              className={
                isDetailedView
                  ? "grid gap-4 md:grid-cols-2"
                  : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              }
            >
              {diaries.map((diary) => (
                <button
                  key={diary.id}
                  type="button"
                  onClick={() => navigate(`/diary/${diary.id}`)}
                  className={
                    isDetailedView
                      ? "cursor-pointer rounded-lg border border-emerald-100 bg-linear-to-br from-white via-emerald-50/70 to-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      : "cursor-pointer rounded-xl border bg-white p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  }
                >
                  {isDetailedView ? (
                    <div className="flex h-full flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-28 w-28 shrink-0 overflow-hidden rounded-lg ${DIARY_EMOTION_BG_CLASS[diary.emotion]}`}
                        >
                          <EmotionImage
                            emotion={diary.emotion}
                            title={diary.title}
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
                          <p className="w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                            {format(
                              new Date(diary.date),
                              "yyyy년 M월 d일 (EEE)",
                              {
                                locale: ko,
                              }
                            )}
                          </p>
                          <p className="line-clamp-2 text-lg leading-snug font-semibold text-slate-900">
                            {diary.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 rounded-lg bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100/80">
                        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase">
                          오늘의 기록
                        </p>
                        <p className="h-[8.75rem] overflow-hidden text-sm leading-7 text-slate-700">
                          {diary.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-end text-sm font-medium text-emerald-700">
                        수정하러 가기
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`aspect-4/3 overflow-hidden rounded-lg ${DIARY_EMOTION_BG_CLASS[diary.emotion]}`}
                      >
                        <EmotionImage
                          emotion={diary.emotion}
                          title={diary.title}
                        />
                      </div>

                      <div className="flex flex-col gap-2 p-4">
                        <p className="line-clamp-1 text-base font-semibold text-foreground">
                          {diary.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(diary.date),
                            "yyyy년 M월 d일 (EEE)",
                            {
                              locale: ko,
                            }
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDateSelectDialogOpen}
        onOpenChange={setIsDateSelectDialogOpen}
      >
        <DialogContent className="w-auto p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>일기 작성 날짜 선택</DialogTitle>
            <DialogDescription>
              작성할 일기의 날짜를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4">
            <Calendar
              mode="single"
              locale={ko}
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </div>
          <DialogFooter className="px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => setIsDateSelectDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleDateSelect}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isEditRedirectDialogOpen}
        onOpenChange={setIsEditRedirectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이미 있는 일기예요</AlertDialogTitle>
            <AlertDialogDescription>수정하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>아니요</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!todayDiaryId) return
                navigate(`/diary/${todayDiaryId}`)
                setIsEditRedirectDialogOpen(false)
              }}
            >
              수정하러 가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
