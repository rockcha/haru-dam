export interface ThemeColor {
  id: number
  color: string
  created_at: string
}

export interface BgTheme {
  user_id: string
  color_id: number
  updated_at: string
}

export interface BgThemeWithColor {
  user_id: string
  color_id: number
  updated_at: string
  theme_color: ThemeColor
}

export interface UpdateBgThemeInput {
  color_id: number
}
