import type { LucideIcon } from "lucide-react"
import {
  BriefcaseBusiness,
  CalendarHeart,
  UserRound,
  PartyPopper,
  Guitar,
} from "lucide-react"

export const SCHEDULE_TYPE_OPTIONS = [
  "개인",
  "약속",
  "업무",
  "이벤트",
  "기타",
] as const

export type ScheduleType = (typeof SCHEDULE_TYPE_OPTIONS)[number]

export const DEFAULT_SCHEDULE_TYPE: ScheduleType = "기타"

type ScheduleTypeMeta = {
  Icon: LucideIcon
  previewClassName: string
  iconBadgeClassName: string
  iconClassName: string
}

export const SCHEDULE_TYPE_META: Record<ScheduleType, ScheduleTypeMeta> = {
  개인: {
    Icon: UserRound,
    previewClassName:
      "border-transparent bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white",
    iconBadgeClassName: "bg-emerald-600",
    iconClassName: "text-emerald-600",
  },
  약속: {
    Icon: CalendarHeart,
    previewClassName:
      "border-transparent bg-rose-500 text-white hover:bg-rose-600 hover:text-white",
    iconBadgeClassName: "bg-rose-500",
    iconClassName: "text-rose-500",
  },
  업무: {
    Icon: BriefcaseBusiness,
    previewClassName:
      "border-transparent bg-cyan-600 text-white hover:bg-cyan-700 hover:text-white",
    iconBadgeClassName: "bg-cyan-600",
    iconClassName: "text-cyan-600",
  },
  이벤트: {
    Icon: PartyPopper,
    previewClassName:
      "border-transparent bg-violet-600 text-white hover:bg-violet-700 hover:text-white",
    iconBadgeClassName: "bg-violet-600",
    iconClassName: "text-violet-600",
  },
  기타: {
    Icon: Guitar,
    previewClassName:
      "border-transparent bg-zinc-600 text-white hover:bg-zinc-700 hover:text-white",
    iconBadgeClassName: "bg-zinc-600",
    iconClassName: "text-zinc-600",
  },
}

export function isScheduleType(value: string): value is ScheduleType {
  return SCHEDULE_TYPE_OPTIONS.some((type) => type === value)
}

export function getScheduleTypeMeta(type?: string | null): ScheduleTypeMeta {
  if (!type || !isScheduleType(type)) {
    return SCHEDULE_TYPE_META[DEFAULT_SCHEDULE_TYPE]
  }

  return SCHEDULE_TYPE_META[type]
}
