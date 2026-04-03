export interface MusicTrack {
  id: string
  user_id: string
  url: string
  title: string
  created_at: string
}

export interface CreateMusicTrackInput {
  url: string
  title: string
}

export interface UpdateMusicTrackInput {
  id: string
  url?: string
  title?: string
}
