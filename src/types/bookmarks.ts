export interface BookmarkType {
  id: string
  user_id: string
  name: string
  color: string | null
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  type_id: string
  title: string
  url: string
  created_at: string
  updated_at: string
}

export interface BookmarkWithType extends Bookmark {
  bookmark_type: BookmarkType | null
}

export interface CreateBookmarkTypeInput {
  name: string
  color?: string
}

export interface UpdateBookmarkTypeInput {
  id: string
  name?: string
  color?: string | null
}

export interface CreateBookmarkInput {
  type_id: string
  title: string
  url: string
}

export interface UpdateBookmarkInput {
  id: string
  type_id?: string
  title?: string
  url?: string
}
