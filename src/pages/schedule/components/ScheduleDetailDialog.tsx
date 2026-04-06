"use client"

import { useState, type KeyboardEvent } from "react"
import { CalendarDays, Pencil, Trash2 } from "lucide-react"

import {
  getScheduleTypeMeta,
  SCHEDULE_TYPE_OPTIONS,
  type ScheduleType,
} from "@/constants/scheduleType"
import { useDeleteSchedule, useUpdateSchedule } from "@/services/schedule"
import type { Schedule } from "@/types/schedule"
import { getFormattedDateTime } from "@/lib/scheduleTime"
import { ScheduleDatePickerField } from "@/pages/schedule/components/ScheduleDatePickerField"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

type FormState = {
  title: string
  date: string
  type: ScheduleType | ""
  time: string
  memo: string
}

const TITLE_MAX_LENGTH = 10
const initialForm: FormState = {
  title: "",
  date: "",
  type: "",
  time: "",
  memo: "",
}

type ScheduleDetailDialogProps = {
  open: boolean
  schedule: Schedule | null
  onOpenChange: (open: boolean) => void
}

export function ScheduleDetailDialog({
  open,
  schedule,
  onOpenChange,
}: ScheduleDetailDialogProps) {
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

  const [isEditMode, setIsEditMode] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)

  const initializeEditForm = (target: Schedule) => {
    setForm({
      title: target.title,
      date: target.date,
      type: target.type ?? "",
      time: target.time === "23:59:59" ? "" : target.time.slice(0, 5),
      memo: target.memo ?? "",
    })
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

  const handleUpdate = async () => {
    if (!schedule) return
    if (!form.title.trim() || !form.date || !form.type) return

    await updateMutation.mutateAsync({
      id: schedule.id,
      title: form.title.trim(),
      date: form.date,
      type: form.type,
      time: form.time,
      memo: form.memo.trim(),
    })

    onOpenChange(false)
  }

  const handleUpdateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return

    event.preventDefault()
    if (
      updateMutation.isPending ||
      !form.title.trim() ||
      !form.date ||
      !form.type
    )
      return

    void handleUpdate()
  }

  const handleDelete = async () => {
    if (!schedule) return

    await deleteMutation.mutateAsync(schedule.id)
    onOpenChange(false)
  }

  const scheduleTypeMeta = schedule ? getScheduleTypeMeta(schedule.type) : null
  const TypeIcon = scheduleTypeMeta?.Icon

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setIsEditMode(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "일정 수정" : "일정 상세"}</DialogTitle>
        </DialogHeader>

        {!schedule ? null : isEditMode ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                maxLength={TITLE_MAX_LENGTH}
                value={form.title}
                onChange={(e) => handleChangeForm("title", e.target.value)}
                onKeyDown={handleUpdateKeyDown}
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">유형</Label>
                <NativeSelect
                  id="edit-type"
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
                <Label htmlFor="edit-time">시간</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChangeForm("time", e.target.value)}
                  onKeyDown={handleUpdateKeyDown}
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
            <h3 className="ellipsis-1 text-2xl leading-tight font-semibold text-foreground">
              {schedule.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {scheduleTypeMeta && TypeIcon && (
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold",
                    scheduleTypeMeta.previewClassName,
                  ].join(" ")}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  {schedule.type ?? "기타"}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/60 px-2 py-1 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {getFormattedDateTime(schedule)}
              </span>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="rounded-lg">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  메모
                </p>
                <p className="text-sm leading-6 text-foreground">
                  {schedule.memo?.trim() ? schedule.memo : "메모가 없어요."}
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
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  취소
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={
                    updateMutation.isPending ||
                    !form.title.trim() ||
                    !form.date ||
                    !form.type
                  }
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {updateMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  if (!schedule) return
                  initializeEditForm(schedule)
                  setIsEditMode(true)
                }}
              >
                <Pencil className="mr-1 h-4 w-4" />
                수정
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
