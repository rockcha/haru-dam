import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const SELECTED_TRACK_KEY = "header-selected-music-track"
const IS_PLAYING_KEY = "header-selected-music-is-playing"
const TRACK_START_OFFSETS_KEY = "header-music-track-start-offsets"

type TrackStartOffsets = Record<string, number>

type MusicPlayerContextValue = {
  selectedTrackId: string
  isPlaying: boolean
  playbackTrackId: string
  playbackCurrentSeconds: number
  playbackDurationSeconds: number
  seekToSeconds: number
  seekRequestId: number
  setSelectedTrackId: (trackId: string) => void
  setIsPlaying: (isPlaying: boolean) => void
  setPlaybackProgress: (payload: {
    trackId: string
    currentSeconds: number
    durationSeconds: number
  }) => void
  requestSeekTo: (seconds: number) => void
  getTrackStartOffset: (trackId: string) => number
  setTrackStartOffset: (trackId: string, startSeconds: number) => void
  playTrack: (trackId: string) => void
  stopPlayback: () => void
  togglePlayback: (fallbackTrackId?: string) => void
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem(SELECTED_TRACK_KEY) ?? ""
  })
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(IS_PLAYING_KEY) === "true"
  })
  const [trackStartOffsets, setTrackStartOffsets] = useState<TrackStartOffsets>(
    () => {
      if (typeof window === "undefined") return {}

      const storedValue = localStorage.getItem(TRACK_START_OFFSETS_KEY)
      if (!storedValue) return {}

      try {
        const parsed = JSON.parse(storedValue) as TrackStartOffsets
        return parsed && typeof parsed === "object" ? parsed : {}
      } catch {
        return {}
      }
    }
  )
  const [playbackTrackId, setPlaybackTrackId] = useState("")
  const [playbackCurrentSeconds, setPlaybackCurrentSeconds] = useState(0)
  const [playbackDurationSeconds, setPlaybackDurationSeconds] = useState(0)
  const [seekToSeconds, setSeekToSeconds] = useState(0)
  const [seekRequestId, setSeekRequestId] = useState(0)

  useEffect(() => {
    localStorage.setItem(SELECTED_TRACK_KEY, selectedTrackId)
  }, [selectedTrackId])

  useEffect(() => {
    localStorage.setItem(IS_PLAYING_KEY, String(isPlaying))
  }, [isPlaying])

  useEffect(() => {
    localStorage.setItem(
      TRACK_START_OFFSETS_KEY,
      JSON.stringify(trackStartOffsets)
    )
  }, [trackStartOffsets])

  const value = useMemo<MusicPlayerContextValue>(
    () => ({
      selectedTrackId,
      isPlaying,
      playbackTrackId,
      playbackCurrentSeconds,
      playbackDurationSeconds,
      seekToSeconds,
      seekRequestId,
      setSelectedTrackId,
      setIsPlaying,
      setPlaybackProgress: ({ trackId, currentSeconds, durationSeconds }) => {
        setPlaybackTrackId(trackId)
        setPlaybackCurrentSeconds(Math.max(0, Math.floor(currentSeconds)))
        setPlaybackDurationSeconds(Math.max(0, Math.floor(durationSeconds)))
      },
      requestSeekTo: (seconds: number) => {
        const normalized = Math.max(0, Math.floor(seconds))
        setSeekToSeconds(normalized)
        setSeekRequestId((prev) => prev + 1)
      },
      getTrackStartOffset: (trackId: string) => {
        return trackStartOffsets[trackId] ?? 0
      },
      setTrackStartOffset: (trackId: string, startSeconds: number) => {
        const normalized = Math.max(0, Math.floor(startSeconds))

        setTrackStartOffsets((prev) => ({
          ...prev,
          [trackId]: normalized,
        }))
      },
      playTrack: (trackId: string) => {
        setSelectedTrackId(trackId)
        setIsPlaying(true)
      },
      stopPlayback: () => {
        setIsPlaying(false)
      },
      togglePlayback: (fallbackTrackId?: string) => {
        if (!selectedTrackId && fallbackTrackId) {
          setSelectedTrackId(fallbackTrackId)
          setIsPlaying(true)
          return
        }

        setIsPlaying((prev) => !prev)
      },
    }),
    [
      isPlaying,
      selectedTrackId,
      playbackTrackId,
      playbackCurrentSeconds,
      playbackDurationSeconds,
      seekToSeconds,
      seekRequestId,
      trackStartOffsets,
    ]
  )

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)

  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider")
  }

  return context
}
