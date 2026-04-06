import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import {
  getScheduleTypeMeta,
  SCHEDULE_TYPE_OPTIONS,
} from "@/constants/scheduleType"
import { Button } from "@/components/ui/button"
import { CardHeader } from "@/components/ui/card"

type ScheduleHeaderProps = {
  currentMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onOpenCreate: () => void
}

export function ScheduleHeader({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onOpenCreate,
}: ScheduleHeaderProps) {
  return (
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-[160px] text-center text-lg font-semibold text-foreground">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </div>

        <Button variant="ghost" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {SCHEDULE_TYPE_OPTIONS.map((type) => {
            const typeMeta = getScheduleTypeMeta(type)
            const TypeIcon = typeMeta.Icon

            return (
              <span
                key={type}
                className={[
                  "text-md inline-flex items-center gap-1 rounded-md px-4 py-2 font-semibold",
                  typeMeta.previewClassName,
                ].join(" ")}
              >
                <TypeIcon className="h-4 w-4" />
                {type}
              </span>
            )
          })}
        </div>

        <Button
          onClick={onOpenCreate}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          일정 추가
        </Button>
      </div>
    </CardHeader>
  )
}
