export type YouTubePlayer = {
  destroy: () => void
  playVideo: () => void
  pauseVideo: () => void
  getCurrentTime: () => number
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
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

export const normalizeYoutubeUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export const isValidYoutubeUrl = (url: string) => {
  try {
    const parsed = new URL(normalizeYoutubeUrl(url))
    const host = parsed.hostname.replace("www.", "")

    return (
      host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com"
    )
  } catch {
    return false
  }
}

export const getYoutubeVideoId = (url: string) => {
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

export const getYoutubeThumbnailUrl = (url: string) => {
  const videoId = getYoutubeVideoId(url)
  if (!videoId) return ""
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export const loadYouTubeIframeApi = () => {
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
