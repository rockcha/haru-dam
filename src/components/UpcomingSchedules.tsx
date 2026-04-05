import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { isAfter } from "date-fns"
import { ChevronDown, ChevronUp } from "lucide-react"

import { useSchedules } from "@/services/schedule"
import { SECTION_DESCRIPTIONS } from "@/constants/sectionDescription"
import {
  getScheduleDateTime,
  getRemainingMinutes,
  formatRemainingTime,
} from "@/lib/scheduleTime"
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
  const navigate = useNavigate()
  const { data: schedules = [], isLoading } = useSchedules()
  const { isCollapsed, toggleCollapsed } = useSectionCollapse("schedules")

  const upcomingSchedules = useMemo(() => {
    const now = new Date()

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
  }, [schedules])

  if (!isLoading && upcomingSchedules.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10">
          <p className="text-center text-sm text-muted-foreground">
            🌿 다가오는 일정이 없어요
          </p>

          <Button onClick={() => navigate("/schedule")}>추가하러 가기</Button>
        </CardContent>
      </Card>
    )
  }

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
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex gap-2 overflow-hidden p-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="basis-[200px] rounded-lg border border-border/60 bg-background p-5 md:basis-[250px]"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-11/12" />
                    <Skeleton className="h-5 w-4/6" />
                  </div>
                  <div className="mt-4 border-t border-border/60 pt-4">
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
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
                {upcomingSchedules.map((schedule, index) => {
                  const remainingMinutes = getRemainingMinutes(schedule)

                  return (
                    <CarouselItem
                      key={schedule.id}
                      className="basis-[200px] pl-2 md:basis-[250px]"
                    >
                      <div className="flex h-full flex-col justify-between rounded-lg border border-border/60 bg-background p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="ellipsis-1 line-clamp-2 text-base leading-snug font-semibold text-foreground">
                              {index === 0 ? "🔥 " : "📌 "}
                              {schedule.title}
                            </h3>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-border/60 pt-4">
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                            ⏳ {formatRemainingTime(remainingMinutes)} 남았어요!
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
            </Carousel>
          )}
        </CardContent>
      )}
    </Card>
  )
}
