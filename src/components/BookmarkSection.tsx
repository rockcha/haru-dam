"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, FolderPlus, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/useAuth"
import {
  useBookmarkTypes,
  useBookmarksWithType,
  useCreateBookmark,
  useCreateBookmarkType,
  useDeleteBookmark,
  useDeleteBookmarkType,
} from "@/services/bookmarks"
import { SECTION_DESCRIPTIONS } from "@/constants/sectionDescription"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { BookmarkType } from "@/types/bookmarks"

import { useSectionCollapse } from "@/hooks/useSectionCollapse"
type BookmarkFormState = {
  title: string
  url: string
  type_id: string
}

type TypeFormState = {
  name: string
}

const MAX_TITLE_LENGTH = 20
const MAX_URL_LENGTH = 300
const MAX_TYPE_NAME_LENGTH = 20

const initialBookmarkForm: BookmarkFormState = {
  title: "",
  url: "",
  type_id: "",
}

const initialTypeForm: TypeFormState = {
  name: "",
}

const normalizeUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const isValidUrl = (url: string) => {
  try {
    new URL(normalizeUrl(url))
    return true
  } catch {
    return false
  }
}

export default function BookmarkSection() {
  const { user } = useAuth()

  const { isCollapsed, toggleCollapsed } = useSectionCollapse("bookmark")

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isTypeOpen, setIsTypeOpen] = useState(false)
  const [isTypeBookmarksOpen, setIsTypeBookmarksOpen] = useState(false)
  const [isDeleteTypeDialogOpen, setIsDeleteTypeDialogOpen] = useState(false)

  const [bookmarkForm, setBookmarkForm] =
    useState<BookmarkFormState>(initialBookmarkForm)
  const [typeForm, setTypeForm] = useState<TypeFormState>(initialTypeForm)

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [deletingType, setDeletingType] = useState<BookmarkType | null>(null)

  const { data: bookmarks = [], isLoading } = useBookmarksWithType()
  const { data: bookmarkTypes = [], isLoading: isBookmarkTypesLoading } =
    useBookmarkTypes()
  const isBookmarkLoading = isLoading || isBookmarkTypesLoading

  const createBookmarkMutation = useCreateBookmark()
  const deleteBookmarkMutation = useDeleteBookmark()
  const createBookmarkTypeMutation = useCreateBookmarkType()
  const deleteBookmarkTypeMutation = useDeleteBookmarkType()

  const bookmarksByType = useMemo(() => {
    return bookmarks.reduce<Record<string, typeof bookmarks>>(
      (acc, bookmark) => {
        const current = acc[bookmark.type_id] ?? []
        acc[bookmark.type_id] = [...current, bookmark]
        return acc
      },
      {}
    )
  }, [bookmarks])

  const selectedType = useMemo(() => {
    if (!selectedTypeId) return null
    return bookmarkTypes.find((type) => type.id === selectedTypeId) ?? null
  }, [bookmarkTypes, selectedTypeId])

  const selectedTypeBookmarks = useMemo(() => {
    if (!selectedTypeId) return []
    return bookmarksByType[selectedTypeId] ?? []
  }, [bookmarksByType, selectedTypeId])

  const badgeCount = bookmarks.length

  const openCreateDialog = () => {
    const defaultTypeId = bookmarkTypes[0]?.id ?? ""

    setBookmarkForm({
      title: "",
      url: "",
      type_id: defaultTypeId,
    })
    setIsCreateOpen(true)
  }

  const handleChangeBookmarkForm = (
    key: keyof BookmarkFormState,
    value: string
  ) => {
    setBookmarkForm((prev) => ({
      ...prev,
      [key]:
        key === "title"
          ? value.slice(0, MAX_TITLE_LENGTH)
          : key === "url"
            ? value.slice(0, MAX_URL_LENGTH)
            : value,
    }))
  }

  const handleChangeTypeForm = (value: string) => {
    setTypeForm({
      name: value.slice(0, MAX_TYPE_NAME_LENGTH),
    })
  }

  const handleCreateBookmark = async () => {
    if (!user) return

    const trimmedTitle = bookmarkForm.title.trim()
    const normalizedUrl = normalizeUrl(bookmarkForm.url)
    const typeId = bookmarkForm.type_id

    if (!trimmedTitle || !normalizedUrl || !typeId) return
    if (!isValidUrl(normalizedUrl)) return

    await createBookmarkMutation.mutateAsync({
      title: trimmedTitle,
      url: normalizedUrl,
      type_id: typeId,
    })

    toast.success("즐겨찾기가 추가되었습니다")

    setIsCreateOpen(false)
    setBookmarkForm(initialBookmarkForm)
  }

  const handleDeleteBookmark = async (bookmarkId: string) => {
    await deleteBookmarkMutation.mutateAsync(bookmarkId)
    toast.success("즐겨찾기가 삭제되었습니다")
  }

  const handleOpenTypeBookmarks = (typeId: string) => {
    setSelectedTypeId(typeId)
    setIsTypeBookmarksOpen(true)
  }

  const handleDeleteType = async (type: BookmarkType) => {
    if (!user) return
    setDeletingType(type)
    setIsDeleteTypeDialogOpen(true)
  }

  const confirmDeleteType = async () => {
    if (!deletingType) return

    await deleteBookmarkTypeMutation.mutateAsync(deletingType.id)
    toast.success("유형이 삭제되었습니다")

    if (selectedTypeId === deletingType.id) {
      setIsTypeBookmarksOpen(false)
      setSelectedTypeId(null)
    }

    setIsDeleteTypeDialogOpen(false)
    setDeletingType(null)
  }

  const handleCreateType = async () => {
    if (!user) return

    const trimmedName = typeForm.name.trim()
    if (!trimmedName) return

    const createdType = await createBookmarkTypeMutation.mutateAsync({
      name: trimmedName,
    })

    toast.success("유형이 추가되었습니다")

    setBookmarkForm((prev) => ({
      ...prev,
      type_id: createdType.id,
    }))

    setTypeForm(initialTypeForm)
    setIsTypeOpen(false)
  }

  const openBookmark = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const titleError = bookmarkForm.title.trim().length === 0
  const urlError =
    bookmarkForm.url.trim().length > 0 && !isValidUrl(bookmarkForm.url)
  const bookmarkSubmitDisabled =
    !user ||
    createBookmarkMutation.isPending ||
    titleError ||
    !bookmarkForm.url.trim() ||
    urlError ||
    !bookmarkForm.type_id

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card className="relative border-emerald-100 shadow-sm">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer">⭐ 즐겨찾기</span>
                    </TooltipTrigger>

                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="max-w-xs"
                    >
                      <p>{SECTION_DESCRIPTIONS.bookmark}</p>
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
                자주 보는 링크를 유형별로 깔끔하게 모아보세요
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? "즐겨찾기 펼치기" : "즐겨찾기 접기"}
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
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTypeOpen(true)}
                  className="sm:w-fit"
                  disabled={!user}
                >
                  <FolderPlus className="mr-1 h-4 w-4" />
                  유형 추가
                </Button>

                <Button
                  onClick={openCreateDialog}
                  disabled={!user || bookmarkTypes.length === 0}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  즐겨찾기 추가
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="min-h-[23rem] space-y-4">
            {!user ? (
              <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                  로그인 후 즐겨찾기를 사용할 수 있어요 🔐
                </p>
              </div>
            ) : isBookmarkLoading ? (
              <ScrollArea className="h-[23rem] rounded-xl border p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="rounded-xl border bg-white p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-5 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-9 w-9" />
                      </div>

                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : bookmarkTypes.length === 0 ? (
              <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                  먼저 유형 하나를 만들어주세요 🌿
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[23rem] rounded-xl border p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkTypes.map((type) => {
                    const typeBookmarks = bookmarksByType[type.id] ?? []
                    return (
                      <div
                        key={type.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenTypeBookmarks(type.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleOpenTypeBookmarks(type.id)
                          }
                        }}
                        className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:bg-emerald-50/40"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-base font-semibold text-foreground">
                              📁 {type.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              즐겨찾기 {typeBookmarks.length}개
                            </p>
                          </div>

                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteType(type)
                            }}
                            disabled={deleteBookmarkTypeMutation.isPending}
                            aria-label="유형 삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-1">
                          {typeBookmarks.slice(0, 3).map((bookmark) => (
                            <p
                              key={bookmark.id}
                              className="line-clamp-1 text-sm text-muted-foreground"
                            >
                              🔗 {bookmark.title}
                            </p>
                          ))}
                          {typeBookmarks.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              아무것도 없어요
                            </p>
                          )}
                          {typeBookmarks.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              외 {typeBookmarks.length - 3}개 더 보기
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>⭐ 즐겨찾기 추가</DialogTitle>
            <DialogDescription>
              저장해두고 싶은 링크를 제목과 함께 등록해보세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="bookmark-title">제목</Label>
              <Input
                id="bookmark-title"
                maxLength={MAX_TITLE_LENGTH}
                value={bookmarkForm.title}
                onChange={(e) =>
                  handleChangeBookmarkForm("title", e.target.value)
                }
                placeholder="예: React 공식 문서"
              />
              <p className="text-right text-xs text-muted-foreground">
                {bookmarkForm.title.length}/{MAX_TITLE_LENGTH}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bookmark-url">링크</Label>
              <Input
                id="bookmark-url"
                maxLength={MAX_URL_LENGTH}
                value={bookmarkForm.url}
                onChange={(e) =>
                  handleChangeBookmarkForm("url", e.target.value)
                }
                placeholder="예: https://react.dev"
              />
              {urlError && (
                <p className="text-xs text-red-500">
                  올바른 링크 형식으로 입력해주세요
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bookmark-type">유형</Label>
              <NativeSelect
                id="bookmark-type"
                value={bookmarkForm.type_id}
                onChange={(e) =>
                  handleChangeBookmarkForm("type_id", e.target.value)
                }
              >
                <NativeSelectOption value="">유형 선택</NativeSelectOption>
                {bookmarkTypes.map((type) => (
                  <NativeSelectOption key={type.id} value={type.id}>
                    {type.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateBookmark}
              disabled={bookmarkSubmitDisabled}
            >
              {createBookmarkMutation.isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTypeOpen} onOpenChange={setIsTypeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>📁 유형 추가</DialogTitle>
            <DialogDescription>
              즐겨찾기를 분류할 새 유형을 만들어보세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <Label htmlFor="type-name">유형 이름</Label>
            <Input
              id="type-name"
              maxLength={MAX_TYPE_NAME_LENGTH}
              value={typeForm.name}
              onChange={(e) => handleChangeTypeForm(e.target.value)}
              placeholder="예: 강의"
            />
            <p className="text-right text-xs text-muted-foreground">
              {typeForm.name.length}/{MAX_TYPE_NAME_LENGTH}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTypeOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateType}
              disabled={
                !user ||
                createBookmarkTypeMutation.isPending ||
                !typeForm.name.trim()
              }
            >
              {createBookmarkTypeMutation.isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTypeBookmarksOpen} onOpenChange={setIsTypeBookmarksOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              📁 {selectedType?.name ?? "유형"} 즐겨찾기
            </DialogTitle>
          </DialogHeader>

          {selectedTypeBookmarks.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              등록된 즐겨찾기가 없어요
            </div>
          ) : (
            <ScrollArea className="h-80 pr-2">
              <div className="space-y-1">
                {selectedTypeBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openBookmark(bookmark.url)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openBookmark(bookmark.url)
                      }
                    }}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-white p-3 transition hover:bg-emerald-50/40"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-foreground sm:text-base">
                      🔗 {bookmark.title}
                    </p>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBookmark(bookmark.id)
                      }}
                      disabled={deleteBookmarkMutation.isPending}
                      aria-label="즐겨찾기 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTypeBookmarksOpen(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteTypeDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteTypeDialogOpen(open)
          if (!open) {
            setDeletingType(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>유형을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingType
                ? `"${deletingType.name}" 유형과 해당 즐겨찾기가 함께 삭제됩니다.`
                : "선택한 유형과 해당 즐겨찾기가 함께 삭제됩니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteType}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
