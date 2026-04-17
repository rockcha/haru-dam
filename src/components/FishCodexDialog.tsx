import { useMemo, useState } from "react"
import { Fish, LockKeyhole, Waves } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { cn } from "@/lib/utils"
import { type FishCodexItem, useFishCodex } from "@/services/fish-codex"

const ALL_RARITIES = "all"

const RARITY_CARD_STYLES: Record<string, string> = {
  normal: "border-zinc-300 bg-zinc-100/90",
  rare: "border-sky-300 bg-sky-100/80",
  epic: "border-violet-300 bg-violet-100/80",
  legendary: "border-amber-300 bg-amber-100/90",
}

const RARITY_IMAGE_STYLES: Record<string, string> = {
  normal: "bg-white/70",
  rare: "bg-white/70",
  epic: "bg-white/70",
  legendary: "bg-white/75",
}

const RARITY_FILTERS = [
  {
    value: ALL_RARITIES,
    label: "전체",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    activeClassName: "ring-emerald-300",
  },
  {
    value: "normal",
    label: "일반",
    description: "포획 확률 50%",
    className: "border-zinc-200 bg-zinc-50 text-zinc-700",
    activeClassName: "ring-zinc-300",
  },
  {
    value: "rare",
    label: "희귀",
    description: "포획 확률 10%",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    activeClassName: "ring-sky-300",
  },
  {
    value: "epic",
    label: "에픽",
    description: "포획 확률 3%",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    activeClassName: "ring-violet-300",
  },
  {
    value: "legendary",
    label: "전설",
    description: "포획 확률 0.5% 미만",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    activeClassName: "ring-amber-300",
  },
] as const

function FishImage({ fish }: { fish: FishCodexItem }) {
  const [hasImageError, setHasImageError] = useState(false)
  const imageSrc = fish.image_url
  const imageClassName = RARITY_IMAGE_STYLES[fish.rarity] ?? "bg-white/70"

  if (!imageSrc || hasImageError) {
    return (
      <div
        className={cn(
          "flex h-32 items-center justify-center rounded-md",
          imageClassName,
          !fish.isOwned && "grayscale"
        )}
      >
        <Fish
          className={cn(
            "h-16 w-16 text-zinc-600",
            !fish.isOwned && "opacity-35"
          )}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex h-32 items-center justify-center rounded-md p-2",
        imageClassName
      )}
    >
      <img
        src={imageSrc}
        alt={fish.label_ko ?? fish.name}
        onError={() => setHasImageError(true)}
        className={cn(
          "max-h-full max-w-[92%] object-contain transition",
          !fish.isOwned && "opacity-35 contrast-125 grayscale"
        )}
      />
    </div>
  )
}

export default function FishCodexDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRarity, setSelectedRarity] = useState(ALL_RARITIES)
  const { data: fishCodex = [], isLoading, isError } = useFishCodex(isOpen)

  const filteredFish = useMemo(() => {
    if (selectedRarity === ALL_RARITIES) return fishCodex
    return fishCodex.filter((fish) => fish.rarity === selectedRarity)
  }, [fishCodex, selectedRarity])

  const ownedCount = fishCodex.filter((fish) => fish.isOwned).length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          도감 확인하기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[86vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-cyan-600" />
            해양도감
          </DialogTitle>
          <DialogDescription>
            야생에서 만날 수 있는 친구들입니다. 전설을 노려보세요!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              보유 {ownedCount} / 전체 {fishCodex.length}
            </div>
          </div>

          <div className="grid gap-2 text-xs sm:grid-cols-5">
            {RARITY_FILTERS.map((filter) => {
              const isSelected = selectedRarity === filter.value

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedRarity(filter.value)}
                  className={cn(
                    "cursor-pointer rounded-md border px-3 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                    filter.className,
                    isSelected && "ring-2 ring-offset-1 ring-offset-white",
                    isSelected && filter.activeClassName
                  )}
                >
                  <span className="flex items-center justify-between gap-2 font-semibold">
                    <span>{filter.label}</span>
                    {"description" in filter ? (
                      <span className="text-[11px] font-medium opacity-80">
                        {filter.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="max-h-[58vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              도감을 불러오는 중
            </div>
          ) : null}

          {isError ? (
            <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              도감을 불러오지 못했어요.
            </div>
          ) : null}

          {!isLoading && !isError && filteredFish.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              이 등급의 물고기가 아직 없어요.
            </div>
          ) : null}

          {!isLoading && !isError && filteredFish.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFish.map((fish) => (
                <article
                  key={fish.id}
                  className={cn(
                    "relative rounded-md border p-3 shadow-sm transition",
                    RARITY_CARD_STYLES[fish.rarity] ??
                      "border-zinc-200 bg-zinc-50",
                    !fish.isOwned && "opacity-80 grayscale-[0.2]"
                  )}
                >
                  {!fish.isOwned ? (
                    <div className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-1 text-zinc-500 shadow-sm">
                      <LockKeyhole className="h-3.5 w-3.5" />
                    </div>
                  ) : null}

                  <FishImage fish={fish} />

                  <div className="mt-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={cn(
                            "font-semibold text-zinc-900",
                            !fish.isOwned && "text-zinc-500"
                          )}
                        >
                          {fish.label_ko ?? fish.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                          {fish.description ?? "조용히 헤엄치는 물고기"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-black/5 pt-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        판매가격
                      </span>
                      <span className="text-sm font-semibold text-amber-600">
                        {fish.sell_price}G
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
