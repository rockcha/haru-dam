"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Clock3, X } from "lucide-react"

import { useDeveloperNotes } from "@/services/developer-note"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const HIDE_KEY = "developer-notes-hide-today"

const getTodayKey = () => {
  return new Date().toLocaleDateString("sv-SE")
}

const isHiddenToday = () => {
  if (typeof window === "undefined") return false
  return localStorage.getItem(HIDE_KEY) === getTodayKey()
}

const hideForToday = () => {
  localStorage.setItem(HIDE_KEY, getTodayKey())
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const target = new Date(dateString)
  const diffMs = now.getTime() - target.getTime()

  if (Number.isNaN(target.getTime())) return ""

  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return "방금 전"
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) {
    const remainHours = diffHours % 24
    return remainHours > 0
      ? `${diffDays}일 ${remainHours}시간 전`
      : `${diffDays}일 전`
  }

  return target.toLocaleDateString("ko-KR")
}

export default function DeveloperNotesPopup() {
  const { data: notes = [], isLoading, isError } = useDeveloperNotes()

  const [isOpen, setIsOpen] = useState(false)
  const [hideTodayChecked, setHideTodayChecked] = useState(false)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setIsOpen(!isHiddenToday())
  }, [])

  useEffect(() => {
    if (notes.length === 0) return

    setOpenItems((prev) => {
      const next = { ...prev }

      for (const note of notes) {
        if (next[note.id] === undefined) {
          next[note.id] = false
        }
      }

      return next
    })
  }, [notes])

  const handleClose = () => {
    if (hideTodayChecked) {
      hideForToday()
    }
    setIsOpen(false)
  }

  const handleHideTodayChange = (checked: boolean) => {
    setHideTodayChecked(checked)

    if (checked) {
      hideForToday()
      setIsOpen(false)
    }
  }

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const noteItems = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      relativeTime: formatRelativeTime(note.created_at),
      opened: openItems[note.id] ?? false,
    }))
  }, [notes, openItems])

  if (!isOpen) return null

  return (
    <div className="fixed top-4 left-4 z-50 w-[320px] sm:w-[420px]">
      <Card className="overflow-hidden bg-white/95 shadow-xl backdrop-blur">
        <CardHeader className="relative space-y-2 border-b">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-emerald-800">
              📢 개발자 노트
            </CardTitle>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="개발자 노트 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="pr-8 text-sm text-muted-foreground">
            최근 반영된 변경사항이나 안내사항을 확인해보세요
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[320px]">
            <div className="px-4">
              {isLoading ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                  공지를 불러오는 중...
                </div>
              ) : isError ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-destructive">
                  공지를 불러오지 못했어요
                </div>
              ) : noteItems.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                  아직 등록된 개발자 공지가 없어요
                </div>
              ) : (
                <div className="space-y-1">
                  {noteItems.map((note) => (
                    <div key={note.id} className="space-y-2">
                      <div className="rounded-lg border bg-white px-4 py-3 shadow-sm transition">
                        <button
                          type="button"
                          onClick={() => toggleItem(note.id)}
                          className="flex w-full cursor-pointer items-start justify-between gap-3 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                                {note.title}
                              </h3>
                            </div>

                            {note.opened ? (
                              <p className="mt-1 ml-4 text-xs text-muted-foreground">
                                {new Date(note.created_at).toLocaleDateString(
                                  "ko-KR",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            ) : (
                              <div className="mt-1 ml-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                                <span>{note.relativeTime}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-0.5 shrink-0 rounded-full bg-emerald-50 p-1.5 text-emerald-700">
                            {note.opened ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </button>

                        {note.opened && (
                          <div className="mt-3 border-t border-emerald-50 pt-3">
                            <p className="text-sm leading-6 break-words whitespace-pre-wrap text-muted-foreground">
                              {note.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
            <label
              htmlFor="hide-today"
              className={cn(
                "flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
              )}
            >
              <Checkbox
                id="hide-today"
                checked={hideTodayChecked}
                onCheckedChange={(checked) =>
                  handleHideTodayChange(checked === true)
                }
                className="cursor-pointer"
              />
              <span>오늘 하루 안보기</span>
            </label>

            <Button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4"
            >
              확인
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
