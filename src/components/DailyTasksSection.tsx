"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react"

import {
  useCreateDailyTask,
  useDailyTasks,
  useDeleteDailyTask,
  useUpdateDailyTask,
} from "@/services/daily-task"
import { SECTION_DESCRIPTIONS } from "@/constants/sectionDescription"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { useSectionCollapse } from "@/hooks/useSectionCollapse"

type FormState = {
  content: string
  is_done: boolean
}

type FilterType = "all" | "done" | "undone"

type DailyTask = {
  id: string
  content: string
  is_done: boolean
  created_at: string
}

const initialForm: FormState = {
  content: "",
  is_done: false,
}

const MAX_CONTENT_LENGTH = 20

export default function DailyTaskSection() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { isCollapsed, toggleCollapsed } = useSectionCollapse("daily")
  const [form, setForm] = useState<FormState>(initialForm)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  const { data: tasks = [], isLoading } = useDailyTasks()
  const createMutation = useCreateDailyTask()
  const updateMutation = useUpdateDailyTask()
  const deleteMutation = useDeleteDailyTask()

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks
    if (filter === "done") return tasks.filter((task) => task.is_done)
    if (filter === "undone") return tasks.filter((task) => !task.is_done)

    return tasks
  }, [tasks, filter])

  const badgeCount =
    filter === "all"
      ? tasks.length
      : filter === "done"
        ? tasks.filter((task) => task.is_done).length
        : tasks.filter((task) => !task.is_done).length

  const openCreateDialog = () => {
    setForm(initialForm)
    setIsCreateOpen(true)
  }

  const openEditDialog = (task: DailyTask) => {
    setEditingTaskId(task.id)
    setForm({
      content: task.content,
      is_done: task.is_done,
    })
    setIsEditOpen(true)
  }

  const closeEditDialog = () => {
    setIsEditOpen(false)
    setEditingTaskId(null)
    setForm(initialForm)
  }

  const handleChangeForm = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]:
        typeof value === "string" ? value.slice(0, MAX_CONTENT_LENGTH) : value,
    }))
  }

  const handleCreate = async () => {
    const trimmed = form.content.trim()
    if (!trimmed) return

    await createMutation.mutateAsync({
      content: trimmed,
      is_done: form.is_done,
    })

    setIsCreateOpen(false)
    setForm(initialForm)
  }

  const handleEdit = async () => {
    const trimmed = form.content.trim()
    if (!trimmed || !editingTaskId) return

    await updateMutation.mutateAsync({
      id: editingTaskId,
      payload: {
        content: trimmed,
        is_done: form.is_done,
      },
    })

    closeEditDialog()
  }

  const handleToggleDone = async (
    taskId: string,
    currentDone: boolean,
    checked: boolean
  ) => {
    if (currentDone === checked) return

    await updateMutation.mutateAsync({
      id: taskId,
      payload: {
        is_done: checked,
      },
    })
  }

  const handleDelete = async (taskId: string) => {
    await deleteMutation.mutateAsync(taskId)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card className="relative border-emerald-100 shadow-sm">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer">🌳 나의 데일리</span>
                    </TooltipTrigger>

                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="max-w-xs"
                    >
                      <p>{SECTION_DESCRIPTIONS.daily}</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>

                {isCollapsed && (
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                    {badgeCount}+
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                매일 반복하는 일을 정리하고 관리하세요
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? "데일리 펼치기" : "데일리 접기"}
              className="absolute top-2 right-2 shrink-0 rounded-full"
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </Button>
          </div>

          {!isCollapsed && (
            <>
              <Tabs
                value={filter}
                onValueChange={(value) => setFilter(value as FilterType)}
                className="w-full"
              >
                <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-muted p-0">
                  <TabsTrigger
                    value="all"
                    className="cursor-pointer rounded-lg text-sm font-medium text-muted-foreground transition data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    전체
                  </TabsTrigger>

                  <TabsTrigger
                    value="done"
                    className="cursor-pointer rounded-lg text-sm font-medium text-muted-foreground transition data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    완료
                  </TabsTrigger>

                  <TabsTrigger
                    value="undone"
                    className="cursor-pointer rounded-lg text-sm font-medium text-muted-foreground transition data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    미완료
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={openCreateDialog}>
                <Plus className="mr-1 h-4 w-4" />
                추가하기
              </Button>
            </>
          )}
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="mx-5 rounded-xl border p-2">
            {isLoading ? (
              <ScrollArea className="h-80 pr-3">
                <div className="space-y-2 p-1">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border p-4"
                    >
                      <Skeleton className="h-6 w-6 rounded-sm" />
                      <Skeleton className="h-4 flex-1" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : filteredTasks.length === 0 ? (
              <div className="flex h-80 items-center justify-center rounded-xl border-2 border-dashed border-emerald-600/80 bg-emerald-50/70 px-4">
                <p className="text-center text-lg font-medium text-emerald-900/70">
                  여기엔 아무것도 없네요..🥲
                </p>
              </div>
            ) : (
              <ScrollArea className="h-80 pr-3">
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 shadow-sm transition hover:bg-muted/40"
                      )}
                    >
                      <Checkbox
                        checked={task.is_done}
                        onCheckedChange={(checked) =>
                          handleToggleDone(
                            task.id,
                            task.is_done,
                            checked === true
                          )
                        }
                        className="h-6 w-6 cursor-pointer"
                      />

                      <div className="flex-1">
                        <p
                          className={cn(
                            "line-clamp-1 text-sm font-medium",
                            task.is_done
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {task.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(task)}
                          disabled={updateMutation.isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(task.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>✍️ 새 데일리 추가</DialogTitle>
            <DialogDescription>
              매일 할 일을 짧고 명확하게 적어보세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="create-content">할 일</Label>
              <Input
                id="create-content"
                maxLength={MAX_CONTENT_LENGTH}
                value={form.content}
                onChange={(e) => handleChangeForm("content", e.target.value)}
                placeholder="예: 물 2L 마시기"
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.content.length}/{MAX_CONTENT_LENGTH}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !form.content.trim()}
            >
              {createMutation.isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <DialogTitle>데일리 수정</DialogTitle>
            <DialogDescription>
              기존 할 일을 원하는 내용으로 수정해보세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-content">할 일</Label>
              <Input
                id="edit-content"
                maxLength={MAX_CONTENT_LENGTH}
                value={form.content}
                onChange={(e) => handleChangeForm("content", e.target.value)}
                placeholder="예: 물 2L 마시기"
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.content.length}/{MAX_CONTENT_LENGTH}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              취소
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateMutation.isPending || !form.content.trim()}
            >
              {updateMutation.isPending ? "수정 중..." : "수정하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
