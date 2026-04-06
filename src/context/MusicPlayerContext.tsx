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

type MusicPlayerContextValue = {
  selectedTrackId: string
  isPlaying: boolean
  setSelectedTrackId: (trackId: string) => void
  setIsPlaying: (isPlaying: boolean) => void
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

  useEffect(() => {
    localStorage.setItem(SELECTED_TRACK_KEY, selectedTrackId)
  }, [selectedTrackId])

  useEffect(() => {
    localStorage.setItem(IS_PLAYING_KEY, String(isPlaying))
  }, [isPlaying])

  const value = useMemo<MusicPlayerContextValue>(
    () => ({
      selectedTrackId,
      isPlaying,
      setSelectedTrackId,
      setIsPlaying,
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
    [isPlaying, selectedTrackId]
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
