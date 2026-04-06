import type { DiaryEmotion } from "@/types/diary"

export const DIARY_EMOTION_RGB: Record<DiaryEmotion, string> = {
  1: "rgb(100,201,100)",
  2: "rgb(157,215,114)",
  3: "rgb(253,206,23)",
  4: "rgb(253,132,70)",
  5: "rgb(253,86,95)",
}

export const DIARY_EMOTION_BG_CLASS: Record<DiaryEmotion, string> = {
  1: "bg-[rgb(100,201,100)]",
  2: "bg-[rgb(157,215,114)]",
  3: "bg-[rgb(253,206,23)]",
  4: "bg-[rgb(253,132,70)]",
  5: "bg-[rgb(253,86,95)]",
}
