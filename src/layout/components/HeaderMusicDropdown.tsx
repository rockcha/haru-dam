import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Music2, VolumeX } from "lucide-react"

import { useMusicTracks } from "@/services/music-track"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type YouTubePlayer = {
  destroy: () => void
  playVideo: () => void
  pauseVideo: () => void
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: () => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YouTubePlayer
      PlayerState: {
        UNSTARTED: -1
        ENDED: 0
        PLAYING: 1
        PAUSED: 2
        BUFFERING: 3
        CUED: 5
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

const PLAYER_ELEMENT_ID = "header-youtube-player"
const SELECTED_TRACK_KEY = "header-selected-music-track"
const IS_PLAYING_KEY = "header-selected-music-is-playing"

const normalizeYoutubeUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const getYoutubeVideoId = (url: string) => {
  try {
    const parsed = new URL(normalizeYoutubeUrl(url))
    const host = parsed.hostname.replace("www.", "")

    if (host === "youtu.be") {
      return parsed.pathname.replace("/", "")
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v") ?? ""
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1] ?? ""
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1] ?? ""
      }
    }

    return ""
  } catch {
    return ""
  }
}

const loadYouTubeIframeApi = () => {
  return new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    )

    if (!existingScript) {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.body.appendChild(script)
    }

    const previous = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
  })
}

const toShortTitle = (title: string) => {
  if (title.length <= 5) return title
  return `${title.slice(0, 5)}...`
}

export default function HeaderMusicDropdown() {
  const { data: tracks = [] } = useMusicTracks()

  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    return localStorage.getItem(SELECTED_TRACK_KEY) ?? ""
  })
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    return localStorage.getItem(IS_PLAYING_KEY) === "true"
  })

  const playerRef = useRef<YouTubePlayer | null>(null)

  const activeTrackId = useMemo(() => {
    if (tracks.some((track) => track.id === selectedTrackId)) {
      return selectedTrackId
    }

    return tracks[0]?.id ?? ""
  }, [tracks, selectedTrackId])

  const selectedTrack = useMemo(() => {
    return tracks.find((track) => track.id === activeTrackId) ?? null
  }, [tracks, activeTrackId])

  const selectedVideoId = selectedTrack
    ? getYoutubeVideoId(selectedTrack.url)
    : ""

  useEffect(() => {
    localStorage.setItem(SELECTED_TRACK_KEY, activeTrackId)
  }, [activeTrackId])

  useEffect(() => {
    localStorage.setItem(IS_PLAYING_KEY, String(isPlaying))
  }, [isPlaying])

  useEffect(() => {
    if (!selectedVideoId) {
      playerRef.current?.destroy?.()
      playerRef.current = null
      return
    }

    let isMounted = true

    const initPlayer = async () => {
      await loadYouTubeIframeApi()
      if (!isMounted || !window.YT?.Player) return

      playerRef.current?.destroy?.()

      playerRef.current = new window.YT.Player(PLAYER_ELEMENT_ID, {
        videoId: selectedVideoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (isPlaying) {
              playerRef.current?.playVideo()
            }
          },
        },
      })
    }

    void initPlayer()

    return () => {
      isMounted = false
    }
  }, [selectedVideoId, isPlaying])

  useEffect(() => {
    if (!playerRef.current) return

    if (isPlaying) {
      playerRef.current.playVideo()
      return
    }

    playerRef.current.pauseVideo()
  }, [isPlaying])

  useEffect(() => {
    return () => {
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [])

  const handleTogglePlay = () => {
    if (!selectedTrack) return

    setIsPlaying((prev) => !prev)
  }

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId)
    setIsPlaying(true)
  }

  return (
    <>
      <div
        id={PLAYER_ELEMENT_ID}
        className="pointer-events-none fixed -right-96 -bottom-96 h-px w-px opacity-0"
        aria-hidden
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className="flex cursor-pointer items-center gap-1"
            disabled={tracks.length === 0}
          >
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                handleTogglePlay()
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  event.stopPropagation()
                  handleTogglePlay()
                }
              }}
              className="inline-flex items-center"
              aria-label={isPlaying ? "음악 일시정지" : "음악 재생"}
            >
              <Music2
                className={cn(
                  "h-4 w-4 transition",
                  isPlaying &&
                    "animate-pulse text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.65)]"
                )}
              />
            </span>

            <span className="hidden sm:inline">
              {toShortTitle(selectedTrack?.title ?? "음악")}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52 rounded-xl border bg-white p-1 shadow-md"
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-xs text-gray-500">
            저장한 음악
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsPlaying(false)}
            disabled={!isPlaying}
            className="cursor-pointer rounded-lg text-gray-700 transition outline-none hover:bg-rose-50 hover:text-rose-600 focus:bg-rose-50 focus:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <VolumeX className="h-4 w-4" />
            음악 끄기
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {tracks.length === 0 ? (
            <DropdownMenuItem
              disabled
              className="rounded-lg text-muted-foreground"
            >
              저장된 음악이 없어요
            </DropdownMenuItem>
          ) : (
            tracks.map((track) => {
              const isSelected = track.id === activeTrackId

              return (
                <DropdownMenuItem
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className="cursor-pointer rounded-lg text-gray-700 transition outline-none hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700"
                >
                  <span className="inline-flex min-w-0 flex-1 items-center gap-2">
                    {isSelected ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span className="ellipsis-1">{track.title}</span>
                  </span>
                </DropdownMenuItem>
              )
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
