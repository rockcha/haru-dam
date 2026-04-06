import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useNavigate, useParams } from "react-router-dom"

import { DIARY_EMOTIONS, type Diary, type DiaryEmotion } from "@/types/diary"
import { useDeleteDiary, useDiary, useUpdateDiary } from "@/services/diary"
import { DIARY_EMOTION_RGB } from "@/constants/diaryEmotion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

type DiaryForm = {
  date: string
  title: string
  emotion: DiaryEmotion
  content: string
}

function DiaryDetailEditor({ diary }: { diary: Diary }) {
  const navigate = useNavigate()
  const updateDiaryMutation = useUpdateDiary()
  const deleteDiaryMutation = useDeleteDiary()

  const [form, setForm] = useState<DiaryForm>({
    date: diary.date,
    title: diary.title,
    emotion: diary.emotion,
    content: diary.content,
  })
  const [hoveredEmotion, setHoveredEmotion] = useState<DiaryEmotion | null>(
    null
  )

  const handleUpdate = async () => {
    if (!form.title.trim() || !form.content.trim()) return

    await updateDiaryMutation.mutateAsync({
      id: diary.id,
      payload: {
        date: form.date,
        title: form.title.trim(),
        emotion: form.emotion,
        content: form.content.trim(),
      },
    })

    navigate("/diaries")
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("이 일기를 삭제할까요?")
    if (!confirmed) return

    await deleteDiaryMutation.mutateAsync(diary.id)
    navigate("/diaries")
  }

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-emerald-700">
          {format(new Date(diary.date), "yyyy년 M월 d일 (EEEE)", {
            locale: ko,
          })}{" "}
          일기
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="diary-title" className="font-semibold">
            제목
          </Label>
          <Input
            id="diary-title"
            maxLength={40}
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label className="font-semibold">감정</Label>
          <div className="grid grid-cols-5 gap-2">
            {DIARY_EMOTIONS.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, emotion }))}
                onMouseEnter={() => setHoveredEmotion(emotion)}
                onMouseLeave={() => setHoveredEmotion(null)}
                className="cursor-pointer overflow-hidden rounded-lg border p-1 transition-colors duration-200"
                style={{
                  backgroundColor:
                    form.emotion === emotion || hoveredEmotion === emotion
                      ? DIARY_EMOTION_RGB[emotion]
                      : undefined,
                  borderColor: "rgba(0, 0, 0, 0.1)",
                }}
              >
                <img
                  src={`/emotions/emotion${emotion}.png`}
                  alt={`감정 ${emotion}`}
                  className="aspect-square w-full rounded-md object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none"
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="diary-content" className="font-semibold">
            내용
          </Label>
          <Textarea
            id="diary-content"
            value={form.content}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, content: event.target.value }))
            }
            className="min-h-72 resize-none text-base leading-relaxed font-medium"
          />
        </div>

        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="outline" onClick={() => navigate("/diaries")}>
            목록으로
          </Button>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDiaryMutation.isPending}
            >
              {deleteDiaryMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>

            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleUpdate}
              disabled={
                updateDiaryMutation.isPending ||
                !form.title.trim() ||
                !form.content.trim()
              }
            >
              {updateDiaryMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DiaryDetail() {
  const { id = "" } = useParams()

  const { data: diary, isLoading, isError } = useDiary(id)

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !diary) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
        <Card className="border-red-100">
          <CardContent className="py-10 text-center text-red-500">
            일기를 찾을 수 없어요.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
      <DiaryDetailEditor key={diary.id} diary={diary} />
    </div>
  )
}
