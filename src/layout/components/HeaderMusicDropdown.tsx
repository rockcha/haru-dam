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
  const { data: tracks = [], isLoading } = useMusicTracks()
  const {
    isPlaying,
    playTrack,
    selectedTrackId,
    setSelectedTrackId,
    stopPlayback,
    togglePlayback,
    getTrackStartOffset,
    setPlaybackProgress,
    seekToSeconds,
    seekRequestId,
    setTrackStartOffset,
  } = useMusicPlayer()

  const playerRef = useRef<YouTubePlayer | null>(null)
  const lastHandledSeekRequestIdRef = useRef(0)

  const activeTrackId = useMemo(() => {
    if (tracks.some((track) => track.id === selectedTrackId)) {
      return selectedTrackId
    }

    return tracks[0]?.id ?? ""
  }, [tracks, selectedTrackId])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!tracks.length) {
      stopPlayback()
      setSelectedTrackId("")
      return
    }

    if (!tracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(tracks[0].id)
    }
  }, [isLoading, selectedTrackId, setSelectedTrackId, stopPlayback, tracks])

  const selectedTrack = useMemo(() => {
    return tracks.find((track) => track.id === activeTrackId) ?? null
  }, [tracks, activeTrackId])

  const selectedVideoId = selectedTrack
    ? getYoutubeVideoId(selectedTrack.url)
    : ""
  const selectedStartOffset = selectedTrack
    ? getTrackStartOffset(selectedTrack.id)
    : 0

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
          start: selectedStartOffset,
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
  }, [selectedVideoId])

  useEffect(() => {
    if (!playerRef.current) return

    if (isPlaying) {
      playerRef.current.playVideo()
      return
    }

    playerRef.current.pauseVideo()
  }, [isPlaying])

  useEffect(() => {
    if (!playerRef.current || !selectedTrack) return

    const timerId = window.setInterval(() => {
      if (!playerRef.current) return

      const currentSeconds = playerRef.current.getCurrentTime?.() ?? 0
      const durationSeconds = playerRef.current.getDuration?.() ?? 0

      setPlaybackProgress({
        trackId: selectedTrack.id,
        currentSeconds,
        durationSeconds,
      })
    }, 500)

    return () => {
      window.clearInterval(timerId)
    }
  }, [selectedTrack, setPlaybackProgress])

  useEffect(() => {
    if (!playerRef.current || !selectedTrack || seekRequestId === 0) return
    if (lastHandledSeekRequestIdRef.current === seekRequestId) return

    lastHandledSeekRequestIdRef.current = seekRequestId

    playerRef.current.seekTo?.(seekToSeconds, true)
    setTrackStartOffset(selectedTrack.id, seekToSeconds)

    if (!isPlaying) {
      playerRef.current.pauseVideo?.()
    }
  }, [
    isPlaying,
    seekRequestId,
    seekToSeconds,
    selectedTrack,
    setTrackStartOffset,
  ])

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
            variant="ghost"
            size="icon"
            className={cn(
              "cursor-pointer rounded-full",
              isPlaying &&
                "bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_18px_rgba(16,185,129,0.22)]"
            )}
            disabled={tracks.length === 0}
            onClick={handleTogglePlay}
            aria-label={isPlaying ? "음악 일시정지" : "음악 재생"}
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
            ? isPlaying
              ? "일시정지"
              : "재생"
            : "재생할 음악이 없어요"}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
