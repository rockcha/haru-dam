import { useEffect, useMemo, useRef } from "react"
import { Music2 } from "lucide-react"

import { useMusicPlayer } from "@/context/MusicPlayerContext"
import { useMusicTracks } from "@/services/music-track"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  getYoutubeVideoId,
  loadYouTubeIframeApi,
  type YouTubePlayer,
} from "@/lib/youtube"

const PLAYER_ELEMENT_ID = "header-youtube-player"

export default function HeaderMusicDropdown() {
  const { data: tracks = [] } = useMusicTracks()
  const {
    isPlaying,
    playTrack,
    selectedTrackId,
    setSelectedTrackId,
    stopPlayback,
    togglePlayback,
  } = useMusicPlayer()

  const playerRef = useRef<YouTubePlayer | null>(null)

  const activeTrackId = useMemo(() => {
    if (tracks.some((track) => track.id === selectedTrackId)) {
      return selectedTrackId
    }

    return tracks[0]?.id ?? ""
  }, [tracks, selectedTrackId])

  useEffect(() => {
    if (!tracks.length) {
      stopPlayback()
      setSelectedTrackId("")
      return
    }

    if (!tracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(tracks[0].id)
    }
  }, [selectedTrackId, setSelectedTrackId, stopPlayback, tracks])

  const selectedTrack = useMemo(() => {
    return tracks.find((track) => track.id === activeTrackId) ?? null
  }, [tracks, activeTrackId])

  const selectedVideoId = selectedTrack
    ? getYoutubeVideoId(selectedTrack.url)
    : ""

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
    if (!activeTrackId) return

    if (activeTrackId !== selectedTrackId) {
      playTrack(activeTrackId)
      return
    }

    togglePlayback(activeTrackId)
  }

  return (
    <>
      <div
        id={PLAYER_ELEMENT_ID}
        className="pointer-events-none fixed -right-96 -bottom-96 h-px w-px opacity-0"
        aria-hidden
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size="icon"
            className={cn(
              "cursor-pointer rounded-full",
              isPlaying &&
                "bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_18px_rgba(16,185,129,0.22)]"
            )}
            disabled={tracks.length === 0}
            onClick={handleTogglePlay}
            aria-label={isPlaying ? "음악 끄기" : "음악 재생"}
          >
            <Music2
              className={cn(
                "h-4 w-4 transition",
                isPlaying &&
                  "animate-pulse text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.65)]"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {selectedTrack
            ? `${selectedTrack.title} ${isPlaying ? "끄기" : "켜기"}`
            : "재생할 음악이 없어요"}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
