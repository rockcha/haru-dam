import { useState, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { format } from "date-fns"

import { DIARY_EMOTIONS, type DiaryEmotion } from "@/types/diary"
import { useCreateDiary } from "@/services/diary"
import { DIARY_EMOTION_RGB } from "@/constants/diaryEmotion"
import { DiaryDatePickerField } from "@/pages/diary/components/DiaryDatePickerField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type DiaryForm = {
  date: string
  title: string
  emotion: DiaryEmotion
  content: string
}

export default function DiaryNew() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createDiaryMutation = useCreateDiary()

  const initialDate = useMemo(() => {
    const dateParam = searchParams.get("date")
    return dateParam || format(new Date(), "yyyy-MM-dd")
  }, [searchParams])

  const [form, setForm] = useState<DiaryForm>({
    date: initialDate,
    title: "",
    emotion: 3,
    content: "",
  })
  const [hoveredEmotion, setHoveredEmotion] = useState<DiaryEmotion | null>(
    null
  )

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return

    await createDiaryMutation.mutateAsync({
      date: form.date,
      title: form.title.trim(),
      emotion: form.emotion,
      content: form.content.trim(),
    })

    navigate("/diaries")
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-700">
            새 일기 작성
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="diary-date">날짜</Label>
            <DiaryDatePickerField
              value={form.date}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, date: value }))
              }
              disabled
            />
          </div>

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
              placeholder="오늘 하루를 한 줄로 표현해보세요"
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
              placeholder="오늘 있었던 일을 기록해보세요"
              className="min-h-72 resize-none text-base leading-relaxed font-medium"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/diaries")}>
              취소
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleSubmit}
              disabled={
                createDiaryMutation.isPending ||
                !form.title.trim() ||
                !form.content.trim()
              }
            >
              {createDiaryMutation.isPending ? "작성 중..." : "작성 완료"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
