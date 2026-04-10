import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import {
  useCheckAttendanceAndGiveGold,
  useTodayAttendance,
} from "@/services/gold"

export default function AttendanceCheckButton() {
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const { data: isCheckedToday = false, isLoading } =
    useTodayAttendance(isAuthenticated)
  const checkAttendanceMutation = useCheckAttendanceAndGiveGold()

  if (!isAuthenticated) {
    return null
  }

  const handleCheckAttendance = async () => {
    try {
      await checkAttendanceMutation.mutateAsync()
    } finally {
      setIsOpen(false)
    }
  }

  const isAttendanceDone = isAuthenticated && !isLoading && isCheckedToday

  const attendanceButtonLabel = isAttendanceDone
    ? "출석 체크 ✅"
    : "출석 체크 ⛔"

  const attendanceButtonClassName =
    "fixed bottom-6 left-6 z-50 h-12 cursor-pointer rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-emerald-500 active:scale-95"

  const attendanceDialogDescription = isAttendanceDone
    ? "이미 출석체크가 완료되었습니다."
    : "출석체크하시겠습니까? 골드 5를 지급받을 수 있습니다."

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${attendanceButtonClassName} ${!isAttendanceDone ? "animate-pulse animation-duration-[2.4s]" : ""}`}
          aria-label="출석 체크 열기"
        >
          {attendanceButtonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>출석 체크</DialogTitle>
          <DialogDescription>{attendanceDialogDescription}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {isAttendanceDone ? (
            <Button
              className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setIsOpen(false)}
            >
              확인
            </Button>
          ) : (
            <Button
              className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleCheckAttendance}
              disabled={isLoading || checkAttendanceMutation.isPending}
            >
              {checkAttendanceMutation.isPending ? "처리 중..." : "출석하기"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
