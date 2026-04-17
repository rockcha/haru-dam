import { useQuery } from "@tanstack/react-query"

import { createClient } from "@/lib/client"

const supabase = createClient()

export const FISH_CODEX_QUERY_KEY = ["fish-codex"] as const

export type FishRarity = "normal" | "rare" | "epic" | "legendary" | string

export type FishCodexItem = {
  id: string
  name: string
  label_ko: string | null
  description: string | null
  rarity: FishRarity
  sell_price: number
  image_path: string | null
  image_url: string | null
  isOwned: boolean
}

type FishSpeciesRow = {
  id: string
  name: string
  label_ko: string | null
  description: string | null
  rarity: FishRarity
  sell_price: number
  image_path: string | null
}

type UserFishCollectionRow = {
  species_id: string
}

function getFishImageUrl(fish: FishSpeciesRow) {
  if (!fish.image_path) return null
  if (fish.image_path.startsWith("http")) return fish.image_path

  const storagePath = fish.image_path.includes("/")
    ? fish.image_path
    : `${fish.rarity}/${fish.image_path}`

  const { data } = supabase.storage
    .from("fish_images")
    .getPublicUrl(storagePath)

  return data.publicUrl
}

const getRequiredUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw new Error(error.message)
  if (!user) throw new Error("로그인이 필요합니다.")

  return user
}

export async function fetchFishCodex(): Promise<FishCodexItem[]> {
  const user = await getRequiredUser()

  const { data: species, error: speciesError } = await supabase
    .from("fish_species")
    .select("id, name, label_ko, description, rarity, sell_price, image_path")
    .order("sell_price", { ascending: true })

  if (speciesError) throw new Error(speciesError.message)

  const { data: collection, error } = await supabase
    .from("user_fish_inventory")
    .select("species_id")
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  const ownedSpeciesIds = new Set(
    ((collection ?? []) as UserFishCollectionRow[]).map(
      (item) => item.species_id
    )
  )

  return ((species ?? []) as FishSpeciesRow[]).map((fish) => ({
    ...fish,
    image_url: getFishImageUrl(fish),
    isOwned: ownedSpeciesIds.has(fish.id),
  }))
}

export function useFishCodex(enabled = true) {
  return useQuery({
    queryKey: FISH_CODEX_QUERY_KEY,
    queryFn: fetchFishCodex,
    enabled,
  })
}
