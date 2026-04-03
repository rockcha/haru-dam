import { differenceInMinutes, format, isValid, parse } from "date-fns"
import { ko } from "date-fns/locale"
import type { Schedule } from "@/types/schedule"

/**
 * 스케줄의 date와 time을 파싱하여 Date 객체 반환
 */
export function getScheduleDateTime(
  schedule: Pick<Schedule, "date" | "time">
): Date {
  const timeValue =
    !schedule.time || schedule.time === "23:59:59"
      ? "23:59"
      : schedule.time.slice(0, 5)

  return parse(`${schedule.date} ${timeValue}`, "yyyy-MM-dd HH:mm", new Date())
}

/**
 * 스케줄까지 남은 시간(분 단위) 반환
 */
export function getRemainingMinutes(
  schedule: Pick<Schedule, "date" | "time">
): number {
  const target = getScheduleDateTime(schedule)
  return differenceInMinutes(target, new Date())
}

/**
 * 날짜와 시간을 포매팅하여 문자열 반환
 * @example
 * getFormattedDateTime(schedule) // "2024년 4월 2일 14시 30분"
 */
export function getFormattedDateTime(
  schedule: Pick<Schedule, "date" | "time">
): string {
  const dateTime = getScheduleDateTime(schedule)

  if (!isValid(dateTime)) return "일시를 확인할 수 없어요"

  return format(dateTime, "yyyy년 M월 d일 HH시 mm분", { locale: ko })
}

/**
 * 남은 시간을 사람이 읽기 좋은 형식으로 반환
 * @example
 * formatRemainingTime(600) // "10시간 작성"
 * formatPastTime(600) // "10시간 지났어요"
 */
export function formatRemainingTime(diffMinutes: number): string {
  if (diffMinutes < 0) {
    return formatPastTime(Math.abs(diffMinutes))
  }

  const days = Math.floor(diffMinutes / (60 * 24))
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60)
  const minutes = diffMinutes % 60

  if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`
  if (hours > 0) return `${hours}시간 ${minutes}분`
  return `${minutes}분`
}

/**
 * 지난 시간을 사람이 읽기 좋은 형식으로 반환
 */
export function formatPastTime(diffMinutes: number): string {
  const days = Math.floor(diffMinutes / (60 * 24))
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60)
  const minutes = diffMinutes % 60

  if (days > 0) return `${days}일 ${hours}시간 ${minutes}분 지났어요`
  if (hours > 0) return `${hours}시간 ${minutes}분 지났어요`
  return `${minutes}분 지났어요`
}

/**
 * 스케줄의 상태를 반영한 전체 텍스트 반환 (남음/지남)
 */
export function getRemainingText(
  schedule: Pick<Schedule, "date" | "time">
): string {
  const diffMinutes = getRemainingMinutes(schedule)

  if (diffMinutes < 0) {
    return formatPastTime(Math.abs(diffMinutes))
  }

  const days = Math.floor(diffMinutes / (60 * 24))
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60)
  const minutes = diffMinutes % 60

  if (days > 0) return `${days}일 ${hours}시간 ${minutes}분 남았어요`
  if (hours > 0) return `${hours}시간 ${minutes}분 남았어요`
  return `${minutes}분 남았어요`
}

/**
 * 스케줄의 짧은 시간 포매팅 (월 일 시간)
 * @example
 * formatShortDateTime(schedule) // "4월 2일 14:30"
 */
export function formatShortDateTime(
  schedule: Pick<Schedule, "date" | "time">
): string {
  const dateTime = getScheduleDateTime(schedule)

  if (!isValid(dateTime)) return "시간 확인 불가"

  return format(dateTime, "M월 d일 HH:mm", { locale: ko })
}
