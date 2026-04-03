"use client"

import { useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ko } from "date-fns/locale"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import {
  useCreateSchedule,
  useDeleteSchedule,
  useSchedules,
  useUpdateSchedule,
} from "@/services/schedule"
import type { Schedule } from "@/types/schedule"
import { getFormattedDateTime } from "@/lib/scheduleTime"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type FormState = {
  title: string
  date: string
  time: string
  memo: string
}

const initialForm: FormState = {
  title: "",
  date: "",
  time: "",
  memo: "",
}

const weekDays = ["일", "월", "화", "수", "목", "금", "토"]
const TITLE_MAX_LENGTH = 10

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

function parseDateString(dateString: string) {
  return parse(dateString, "yyyy-MM-dd", new Date())
}

function DatePickerField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const selectedDate = value ? parseDateString(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
        >
          {selectedDate
            ? format(selectedDate, "yyyy년 M월 d일", { locale: ko })
            : "날짜를 선택하세요"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ko}
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, "yyyy-MM-dd"))
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  )

  const [isEditMode, setIsEditMode] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)

  const { data: schedules = [], isLoading } = useSchedules()
  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

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
      time: "",
      memo: "",
    })
    setIsCreateOpen(true)
  }

  const openDetailDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsEditMode(false)
    setForm({
      title: schedule.title,
      date: schedule.date,
      time: schedule.time === "23:59:59" ? "" : schedule.time.slice(0, 5),
      memo: schedule.memo ?? "",
    })
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

    await createMutation.mutateAsync({
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      memo: form.memo.trim(),
    })

    setIsCreateOpen(false)
    setForm(initialForm)
  }

  const handleUpdate = async () => {
    if (!selectedSchedule) return
    if (!form.title.trim()) return

    await updateMutation.mutateAsync({
      id: selectedSchedule.id,
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      memo: form.memo.trim(),
    })

    setIsDetailOpen(false)
    setSelectedSchedule(null)
    setIsEditMode(false)
    setForm(initialForm)
  }

  const handleDelete = async () => {
    if (!selectedSchedule) return

    await deleteMutation.mutateAsync(selectedSchedule.id)

    setIsDetailOpen(false)
    setSelectedSchedule(null)
    setIsEditMode(false)
    setForm(initialForm)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-emerald-700">
              <CalendarDays className="h-6 w-6" />
              캘린더
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              일정 혹은 마감되는 과제를 관리하세요
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-[160px] text-center text-lg font-semibold text-foreground">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </div>

            <Button
              variant="ghost"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => openCreateDialog()}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            일정 추가
          </Button>
        </CardHeader>

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
                    isCurrentMonth ? "" : "bg-muted/25 text-muted-foreground",
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
                        isToday ? "bg-rose-600 text-white" : "text-foreground",
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
              제목, 날짜, 시간, 메모를 입력해 일정을 등록하세요.
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
                placeholder="예: 운동, 미팅, 과제 제출"
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>날짜</Label>
                <DatePickerField
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
                createMutation.isPending || !form.title.trim() || !form.date
              }
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {createMutation.isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) {
            setIsEditMode(false)
            setSelectedSchedule(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "일정 수정" : "일정 상세"}</DialogTitle>
          </DialogHeader>

          {!selectedSchedule ? null : isEditMode ? (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  maxLength={TITLE_MAX_LENGTH}
                  value={form.title}
                  onChange={(e) => handleChangeForm("title", e.target.value)}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {form.title.length}/{TITLE_MAX_LENGTH}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>날짜</Label>
                  <DatePickerField
                    value={form.date}
                    onChange={(value) => handleChangeForm("date", value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-time">시간</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={form.time}
                    onChange={(e) => handleChangeForm("time", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-memo">메모</Label>
                <Textarea
                  id="edit-memo"
                  value={form.memo}
                  onChange={(e) => handleChangeForm("memo", e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <CalendarDays size={20} />
                {getFormattedDateTime(selectedSchedule)}
              </div>

              <h3 className="ellipsis-1 text-2xl text-foreground">
                {selectedSchedule.title}
              </h3>

              <Separator />

              <div className="space-y-3">
                <div className="rounded-lg">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    메모
                  </p>
                  <p className="text-sm leading-6 text-foreground">
                    {selectedSchedule.memo?.trim()
                      ? selectedSchedule.memo
                      : "메모가 없어요."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              {!isEditMode && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={
                      updateMutation.isPending ||
                      !form.title.trim() ||
                      !form.date
                    }
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {updateMutation.isPending ? "저장 중..." : "저장"}
                  </Button>
                </>
              ) : (
                <Button variant={"outline"} onClick={() => setIsEditMode(true)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  수정
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
