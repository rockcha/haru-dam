"use client"

import { useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import {
  useBookmarkTypes,
  useBookmarksWithType,
  useCreateBookmark,
  useCreateBookmarkType,
  useDeleteBookmark,
  useUpdateBookmark,
} from "@/services/bookmarks"
import { SECTION_DESCRIPTIONS } from "@/constants/sectionDescription"
import { Button } from "@/components/ui/button"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { BookmarkWithType } from "@/types/bookmarks"

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

const ALL_FILTER_VALUE = "all"

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
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isTypeOpen, setIsTypeOpen] = useState(false)

  const [bookmarkForm, setBookmarkForm] =
    useState<BookmarkFormState>(initialBookmarkForm)
  const [typeForm, setTypeForm] = useState<TypeFormState>(initialTypeForm)

  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
    null
  )
  const [filterTypeId, setFilterTypeId] = useState<string>(ALL_FILTER_VALUE)

  const { data: bookmarks = [], isLoading } = useBookmarksWithType()
  const { data: bookmarkTypes = [] } = useBookmarkTypes()

  const createBookmarkMutation = useCreateBookmark()
  const updateBookmarkMutation = useUpdateBookmark()
  const deleteBookmarkMutation = useDeleteBookmark()
  const createBookmarkTypeMutation = useCreateBookmarkType()

  const filteredBookmarks = useMemo(() => {
    if (filterTypeId === ALL_FILTER_VALUE) return bookmarks
    return bookmarks.filter((bookmark) => bookmark.type_id === filterTypeId)
  }, [bookmarks, filterTypeId])

  const badgeCount = filteredBookmarks.length

  const openCreateDialog = () => {
    const defaultTypeId = bookmarkTypes[0]?.id ?? ""

    setBookmarkForm({
      title: "",
      url: "",
      type_id: defaultTypeId,
    })
    setIsCreateOpen(true)
  }

  const openEditDialog = (bookmark: BookmarkWithType) => {
    setEditingBookmarkId(bookmark.id)
    setBookmarkForm({
      title: bookmark.title,
      url: bookmark.url,
      type_id: bookmark.type_id,
    })
    setIsEditOpen(true)
  }

  const closeEditDialog = () => {
    setEditingBookmarkId(null)
    setBookmarkForm(initialBookmarkForm)
    setIsEditOpen(false)
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

    setIsCreateOpen(false)
    setBookmarkForm(initialBookmarkForm)
  }

  const handleEditBookmark = async () => {
    const trimmedTitle = bookmarkForm.title.trim()
    const normalizedUrl = normalizeUrl(bookmarkForm.url)
    const typeId = bookmarkForm.type_id

    if (!editingBookmarkId || !trimmedTitle || !normalizedUrl || !typeId) return
    if (!isValidUrl(normalizedUrl)) return

    await updateBookmarkMutation.mutateAsync({
      id: editingBookmarkId,
      title: trimmedTitle,
      url: normalizedUrl,
      type_id: typeId,
    })

    closeEditDialog()
  }

  const handleDeleteBookmark = async (bookmarkId: string) => {
    await deleteBookmarkMutation.mutateAsync(bookmarkId)
  }

  const handleCreateType = async () => {
    if (!user) return

    const trimmedName = typeForm.name.trim()
    if (!trimmedName) return

    const createdType = await createBookmarkTypeMutation.mutateAsync({
      name: trimmedName,
    })

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
    updateBookmarkMutation.isPending ||
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
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <div className="w-full">
                  <NativeSelect
                    value={filterTypeId}
                    onChange={(e) => setFilterTypeId(e.target.value)}
                    aria-label="즐겨찾기 유형 필터"
                  >
                    <NativeSelectOption value={ALL_FILTER_VALUE}>
                      전체
                    </NativeSelectOption>
                    {bookmarkTypes.map((type) => (
                      <NativeSelectOption key={type.id} value={type.id}>
                        {type.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

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
            </div>
          )}
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-4">
            {!user ? (
              <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                  로그인 후 즐겨찾기를 사용할 수 있어요 🔐
                </p>
              </div>
            ) : bookmarkTypes.length === 0 ? (
              <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                  먼저 유형 하나를 만들어주세요 🌿
                </p>
              </div>
            ) : isLoading ? (
              <div className="text-sm text-muted-foreground">
                즐겨찾기를 불러오는 중...
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="relative rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 py-14">
                <p className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground">
                  아무것도 없어요...🍃
                </p>
              </div>
            ) : (
              <ScrollArea className="h-35 pr-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBookmarks.map((bookmark) => (
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
                      className="cursor-pointer rounded-lg border border-border bg-white p-4 shadow-sm transition hover:bg-emerald-50/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-left text-sm font-semibold text-foreground sm:text-base">
                            🔗 {bookmark.title}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDialog(bookmark)
                            }}
                            disabled={updateBookmarkMutation.isPending}
                            aria-label="즐겨찾기 수정"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>즐겨찾기 수정</DialogTitle>
            <DialogDescription>
              제목, 링크, 유형을 원하는 값으로 변경해보세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-bookmark-title">제목</Label>
              <Input
                id="edit-bookmark-title"
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
              <Label htmlFor="edit-bookmark-url">링크</Label>
              <Input
                id="edit-bookmark-url"
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
              <Label htmlFor="edit-bookmark-type">유형</Label>
              <NativeSelect
                id="edit-bookmark-type"
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
            <Button variant="outline" onClick={closeEditDialog}>
              취소
            </Button>
            <Button
              onClick={handleEditBookmark}
              disabled={bookmarkSubmitDisabled}
            >
              {updateBookmarkMutation.isPending ? "수정 중..." : "수정하기"}
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
    </div>
  )
}
