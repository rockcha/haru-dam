"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import {
  useCreateMemo,
  useDeleteMemo,
  useMemos,
  useUpdateMemo,
} from "@/services/memo"

import { SECTION_DESCRIPTIONS } from "@/constants/sectionDescription"
import { MEMO_EMOJIS } from "@/constants/emojis"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useSectionCollapse } from "@/hooks/useSectionCollapse"

const MAX_LENGTH = 1000
const AUTO_SAVE_DELAY = 500

export default function MemoSection() {
  const { user } = useAuth()

  const { isCollapsed, toggleCollapsed } = useSectionCollapse("memo")
  const [isClearOpen, setIsClearOpen] = useState(false)

  const [content, setContent] = useState("")

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isHydratingRef = useRef(false)
  const latestMemoIdRef = useRef<string | null>(null)

  const { data: memos = [], isLoading } = useMemos()
  const createMutation = useCreateMemo()
  const updateMutation = useUpdateMemo()
  const deleteMutation = useDeleteMemo()

  const memo = useMemo(() => memos[0] ?? null, [memos])

  useEffect(() => {
    isHydratingRef.current = true

    if (!memo) {
      latestMemoIdRef.current = null
      queueMicrotask(() => {
        setContent("")
        isHydratingRef.current = false
      })
      return
    }

    latestMemoIdRef.current = memo.id

    queueMicrotask(() => {
      setContent(memo.content)
      isHydratingRef.current = false
    })
  }, [memo])

  useEffect(() => {
    if (!user) return
    if (isHydratingRef.current) return

    const trimmedContent = content.trim()

    if (!trimmedContent) return
    if (trimmedContent === (memo?.content ?? "")) return
    if (createMutation.isPending || updateMutation.isPending) return

    const timer = setTimeout(async () => {
      const targetMemoId = memo?.id ?? latestMemoIdRef.current

      if (!targetMemoId) {
        const created = await createMutation.mutateAsync({
          content: trimmedContent,
        })
        latestMemoIdRef.current = created.id
        return
      }

      await updateMutation.mutateAsync({
        id: targetMemoId,
        payload: {
          content: trimmedContent,
        },
      })
    }, AUTO_SAVE_DELAY)

    return () => clearTimeout(timer)
  }, [user, content, memo, createMutation, updateMutation])

  const handleContentChange = (value: string) => {
    setContent(value.slice(0, MAX_LENGTH))
  }

  const handleInsertEmoji = (emoji: string) => {
    const textarea = textareaRef.current

    if (!textarea) {
      setContent((prev) => `${prev}${emoji}`.slice(0, MAX_LENGTH))
      return
    }

    const start = textarea.selectionStart ?? content.length
    const end = textarea.selectionEnd ?? content.length

    const nextValue =
      `${content.slice(0, start)}${emoji}${content.slice(end)}`.slice(
        0,
        MAX_LENGTH
      )

    const nextCursor = Math.min(start + emoji.length, nextValue.length)

    setContent(nextValue)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const handleClear = async () => {
    const targetMemoId = memo?.id ?? latestMemoIdRef.current

    if (targetMemoId) {
      await deleteMutation.mutateAsync(targetMemoId)
    }

    latestMemoIdRef.current = null
    setContent("")
    setIsClearOpen(false)
  }

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const canClear = Boolean(memo?.id || content.trim())

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card className="relative shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer">📝 메모</span>
                    </TooltipTrigger>

                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="max-w-xs"
                    >
                      <p>{SECTION_DESCRIPTIONS.memo}</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </div>

              <p className="text-sm text-muted-foreground">
                떠오른 생각을 가볍게 남겨두세요
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? "메모 펼치기" : "메모 접기"}
              className="absolute top-2 right-2 shrink-0 rounded-full"
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-4">
            {!user ? (
              <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                  로그인 후 메모를 사용할 수 있어요 🔐
                </p>
              </div>
            ) : isLoading ? (
              <>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-9 rounded-md" />
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                  {MEMO_EMOJIS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleInsertEmoji(item)}
                      className="cursor-pointer rounded-md px-2 py-1 text-lg transition hover:bg-muted"
                      aria-label={`이모지 ${item} 삽입`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
                  <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="메모를 입력하세요..."
                    className="h-48 resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {content.length}/{MAX_LENGTH}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsClearOpen(true)}
                    disabled={!canClear || isPending}
                  >
                    비우기
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      <AlertDialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메모를 비울까요?</AlertDialogTitle>
            <AlertDialogDescription>
              현재 작성된 메모 내용이 사라져요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>비우기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
