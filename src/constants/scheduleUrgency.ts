export interface ScheduleUrgencyStyle {
  cardClassName: string
  timeTextClassName: string
  timeIconClassName: string
  titleIconClassName: string
  titleEmoji: string
}

const MINUTES_PER_DAY = 60 * 24

const DEFAULT_URGENCY_STYLE: ScheduleUrgencyStyle = {
  cardClassName: "border-border/60 bg-white",
  timeTextClassName: "text-slate-700",
  timeIconClassName: "text-slate-500",
  titleIconClassName: "text-slate-600",
  titleEmoji: "📌",
}

interface UrgencyRule {
  thresholdMinutes: number
  style: ScheduleUrgencyStyle
}

const URGENCY_RULES: UrgencyRule[] = [
  {
    thresholdMinutes: MINUTES_PER_DAY,
    style: {
      cardClassName: "border-border/60 bg-white",
      timeTextClassName: "text-rose-700",
      timeIconClassName: "text-rose-500",
      titleIconClassName: "text-rose-600",
      titleEmoji: "🚨",
    },
  },
  {
    thresholdMinutes: MINUTES_PER_DAY * 2,
    style: {
      cardClassName: "border-border/60 bg-white",
      timeTextClassName: "text-amber-700",
      timeIconClassName: "text-amber-500",
      titleIconClassName: "text-orange-600",
      titleEmoji: "⚠️",
    },
  },
  {
    thresholdMinutes: MINUTES_PER_DAY * 3,
    style: {
      cardClassName: "border-border/60 bg-white",
      timeTextClassName: "text-amber-700",
      timeIconClassName: "text-orange-500",
      titleIconClassName: "text-amber-600",
      titleEmoji: "🔥",
    },
  },
  {
    thresholdMinutes: MINUTES_PER_DAY * 7,
    style: {
      cardClassName: "border-border/60 bg-white",
      timeTextClassName: "text-sky-700",
      timeIconClassName: "text-sky-500",
      titleIconClassName: "text-sky-600",
      titleEmoji: "🚀",
    },
  },
  {
    thresholdMinutes: MINUTES_PER_DAY * 14,
    style: {
      cardClassName: "border-border/60 bg-white",
      timeTextClassName: "text-emerald-700",
      timeIconClassName: "text-emerald-500",
      titleIconClassName: "text-emerald-600",
      titleEmoji: "🍀",
    },
  },
]

export function getScheduleUrgencyStyle(
  remainingMinutes: number
): ScheduleUrgencyStyle {
  const matchedRule = URGENCY_RULES.find(
    (rule) => remainingMinutes <= rule.thresholdMinutes
  )

  return matchedRule?.style ?? DEFAULT_URGENCY_STYLE
}
