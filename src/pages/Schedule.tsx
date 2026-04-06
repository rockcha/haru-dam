"use client"

import { useMemo, useState, type KeyboardEvent } from "react"
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import {
  getScheduleTypeMeta,
  SCHEDULE_TYPE_OPTIONS,
  type ScheduleType,
} from "@/constants/scheduleType"
import { useCreateSchedule, useSchedules } from "@/services/schedule"
import type { Schedule } from "@/types/schedule"
import { ScheduleDatePickerField } from "@/pages/schedule/components/ScheduleDatePickerField"
import { ScheduleDetailDialog } from "@/pages/schedule/components/ScheduleDetailDialog"
import { ScheduleHeader } from "@/pages/schedule/components/ScheduleHeader"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

type FormState = {
  title: string
  date: string
  type: ScheduleType | ""
  time: string
  memo: string
}

const initialForm: FormState = {
  title: "",
  date: "",
  type: "",
  time: "",
  memo: "",
}

const weekDays = ["일", "월", "화", "수", "목", "금", "토"]
const TITLE_MAX_LENGTH = 10

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  )
  const [form, setForm] = useState<FormState>(initialForm)

  const { data: schedules = [], isLoading } = useSchedules()
  const createMutation = useCreateSchedule()

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>()

    for (const schedule of schedules) {
      const key = schedule.date
      const prev = map.get(key) ?? []
      const updated = [...prev, schedule].sort((a, b) =>
        a.time.localeCompare(b.time)
      )
      map.set(key, updated)
    }

    return map
  }, [schedules])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days: Date[] = []
    let day = calendarStart

    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentMonth])

  const openCreateDialog = (date?: string) => {
    const targetDate = date ?? format(new Date(), "yyyy-MM-dd")

    setForm({
      title: "",
      date: targetDate,
      type: "",
      time: "",
      memo: "",
    })
    setIsCreateOpen(true)
  }

  const openDetailDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDetailOpen(true)
  }

  const handleChangeForm = (key: keyof FormState, value: string) => {
    if (key === "title") {
      setForm((prev) => ({
        ...prev,
        title: value.slice(0, TITLE_MAX_LENGTH),
      }))
      return
    }

    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return
    if (!form.type) return

    await createMutation.mutateAsync({
      title: form.title.trim(),
      date: form.date,
      type: form.type,
      time: form.time,
      memo: form.memo.trim(),
    })

    setIsCreateOpen(false)
    setForm(initialForm)
  }

  const handleCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return

    event.preventDefault()
    if (
      createMutation.isPending ||
      !form.title.trim() ||
      !form.date ||
      !form.type
    )
      return

    void handleCreate()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <Card className="border-emerald-100 shadow-sm">
        <ScheduleHeader
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth((prev) => subMonths(prev, 1))}
          onNextMonth={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          onOpenCreate={() => openCreateDialog()}
        />

        <CardContent>
          <div className="grid grid-cols-7 overflow-hidden rounded-2xl border">
            {weekDays.map((day) => (
              <div
                key={day}
                className="border-b bg-emerald-50/70 px-2 py-3 text-center text-sm font-semibold text-emerald-800"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const key = getDateKey(day)
              const daySchedules = schedulesByDate.get(key) ?? []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={key}
                  className={[
                    "flex h-40 min-h-40 flex-col border-r border-b bg-white p-2",
                    "min-h-0",
                    isCurrentMonth ? "" : "bg-slate-50 text-slate-400",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => openCreateDialog(key)}
                    className="mb-2 flex w-fit cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-sm font-medium hover:bg-emerald-50"
                  >
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        isToday
                          ? "bg-green-500/50 text-slate-900"
                          : "text-slate-700",
                      ].join(" ")}
                    >
                      {format(day, "d")}
                    </span>
                  </button>

                  <div className="min-h-0 flex-1">
                    <ScrollArea className="h-full pr-1">
                      <div className="space-y-1">
                        {daySchedules.map((schedule) => (
                          <Button
                            key={schedule.id}
                            onClick={() => openDetailDialog(schedule)}
                            variant="outline"
                            className={[
                              "h-auto w-fit max-w-full justify-start p-2 text-left text-xs font-medium",
                              getScheduleTypeMeta(schedule.type)
                                .previewClassName,
                            ].join(" ")}
                          >
                            <div className="truncate text-xs">
                              {schedule.title}
                            </div>
                          </Button>
                        ))}

                        {daySchedules.length === 0 && (
                          <div className="px-1 py-1 text-xs text-muted-foreground/80">
                            일정 없음
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )
            })}
          </div>

          {isLoading && (
            <div className="mt-4 text-sm text-muted-foreground">
              일정을 불러오는 중...
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>새 일정 추가</DialogTitle>
            <DialogDescription>
              제목, 유형, 날짜, 시간, 메모를 입력해 일정을 등록하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="create-title">제목</Label>
              <Input
                id="create-title"
                maxLength={TITLE_MAX_LENGTH}
                value={form.title}
                onChange={(e) => handleChangeForm("title", e.target.value)}
                onKeyDown={handleCreateKeyDown}
                placeholder="예: 운동, 미팅, 과제 제출"
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="create-type">유형</Label>
                <NativeSelect
                  id="create-type"
                  value={form.type}
                  onChange={(e) => handleChangeForm("type", e.target.value)}
                >
                  <NativeSelectOption value="">유형 선택</NativeSelectOption>
                  {SCHEDULE_TYPE_OPTIONS.map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      {type}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="grid gap-2">
                <Label>날짜</Label>
                <ScheduleDatePickerField
                  value={form.date}
                  onChange={(value) => handleChangeForm("date", value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-time">시간</Label>
                <Input
                  id="create-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChangeForm("time", e.target.value)}
                  onKeyDown={handleCreateKeyDown}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-memo">메모</Label>
              <Textarea
                id="create-memo"
                value={form.memo}
                onChange={(e) => handleChangeForm("memo", e.target.value)}
                placeholder="간단한 메모를 남겨보세요."
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createMutation.isPending ||
                !form.title.trim() ||
                !form.date ||
                !form.type
              }
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {createMutation.isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScheduleDetailDialog
        open={isDetailOpen}
        schedule={selectedSchedule}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) {
            setSelectedSchedule(null)
          }
        }}
      />
    </div>
  )
}
