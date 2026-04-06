import { useEffect, useMemo, useState } from "react"

import { isAfter } from "date-fns"
import { ChevronDown, ChevronUp, Timer } from "lucide-react"

import { useSchedules } from "@/services/schedule"
import type { Schedule } from "@/types/schedule"
import { SECTION_DESCRIPTIONS } from "@/constants/sectionDescription"
import { getScheduleTypeMeta } from "@/constants/scheduleType"
import { getScheduleUrgencyStyle } from "@/constants/scheduleUrgency"
import { ScheduleDetailDialog } from "@/pages/schedule/components/ScheduleDetailDialog"
import {
  getScheduleDateTime,
  getRemainingMinutes,
  formatRemainingTime,
} from "@/lib/scheduleTime"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

import { useSectionCollapse } from "@/hooks/useSectionCollapse"

export function UpcomingSchedules() {
  const { data: schedules = [], isLoading } = useSchedules()
  const [now, setNow] = useState(() => new Date())
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  )
  const { isCollapsed, toggleCollapsed } = useSectionCollapse("schedules")

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [])

  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter((schedule) => {
        const scheduleDateTime = getScheduleDateTime(schedule)
        return isAfter(scheduleDateTime, now)
      })
      .sort((a, b) => {
        const minA = getRemainingMinutes(a)
        const minB = getRemainingMinutes(b)
        return minA - minB
      })
  }, [now, schedules])

  return (
    <Card className="relative overflow-hidden border-border/60 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer">🐾 다가오는 일정</span>
                </TooltipTrigger>

                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-w-xs"
                >
                  <p>{SECTION_DESCRIPTIONS.schedules}</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>

            {isCollapsed && (
              <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                {upcomingSchedules.length}+
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            곧 다가오는 일정들을 한 눈에 확인해요
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          aria-label={
            isCollapsed ? "다가오는 일정 펼치기" : "다가오는 일정 접기"
          }
          className="absolute top-2 right-2 shrink-0 rounded-full"
        >
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="basis-[200px] rounded-lg border border-border/60 bg-background p-5 md:basis-[250px]"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-11/12" />
                    <Skeleton className="h-5 w-4/6" />
                  </div>
                  <div className="mt-4">
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingSchedules.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center rounded-xl border-2 border-dashed border-emerald-600/80 bg-emerald-50/70 px-4">
              <p className="text-center text-lg font-medium text-emerald-900/70">
                여기엔 아무것도 없네요..🥲
              </p>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="m-1 cursor-grab active:cursor-grabbing">
                {upcomingSchedules.map((schedule) => {
                  const remainingMinutes = getRemainingMinutes(schedule)
                  const urgencyStyle = getScheduleUrgencyStyle(remainingMinutes)
                  const TypeIcon = getScheduleTypeMeta(schedule.type).Icon

                  return (
                    <CarouselItem
                      key={schedule.id}
                      className="basis-[200px] pl-2 md:basis-[250px]"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchedule(schedule)
                          setIsDetailOpen(true)
                        }}
                        className={cn(
                          "relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden rounded-lg border p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                          urgencyStyle.cardClassName
                        )}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="line-clamp-2 flex-1 text-base leading-snug font-semibold text-foreground">
                              {schedule.title}
                            </h3>

                            <span
                              className={cn(
                                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white shadow-sm",
                                getScheduleTypeMeta(schedule.type)
                                  .iconBadgeClassName
                              )}
                            >
                              <TypeIcon className="h-4 w-4" />
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <Timer
                              className={cn(
                                "h-4 w-4",
                                urgencyStyle.timeIconClassName
                              )}
                            />
                            <span className={urgencyStyle.timeTextClassName}>
                              {formatRemainingTime(remainingMinutes)}
                            </span>
                            <span className="text-muted-foreground">
                              남았어요!
                            </span>
                          </p>
                        </div>
                      </button>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
            </Carousel>
          )}
        </CardContent>
      )}

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
    </Card>
  )
}
