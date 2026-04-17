import { useState } from "react"
import { BookOpen, Fish, Minus, Plus, ShoppingBasket } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FishCodexDialog from "@/components/FishCodexDialog"
import { useBuyBait, useMyBaitCount } from "@/services/bait"

const BAIT_PRICE = 5

export default function Fishing() {
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { data: baitCount = 0, isLoading: isBaitLoading } = useMyBaitCount()
  const { mutateAsync: buyBait, isPending: isBuyingBait } = useBuyBait()

  const normalizedQuantity = Number.isFinite(quantity)
    ? Math.max(1, Math.floor(quantity))
    : 1
  const totalCost = normalizedQuantity * BAIT_PRICE

  const handleQuantityChange = (value: string) => {
    const nextQuantity = Number(value)
    setQuantity(Number.isFinite(nextQuantity) ? nextQuantity : 1)
  }

  const handleBuyBait = async () => {
    await buyBait(normalizedQuantity)
    setQuantity(1)
    setIsBuyDialogOpen(false)
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col gap-4 p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <ShoppingBasket className="h-4 w-4" />
                미끼통
              </p>
              <div className="mt-1 rounded-md bg-emerald-50 px-3 py-2">
                <p className="text-lg font-semibold leading-none text-zinc-900">
                  {isBaitLoading ? "불러오는 중" : `🐟 x ${baitCount}`}
                </p>
              </div>
            </div>

            <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  미끼 구매
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>미끼 구매</DialogTitle>
                  <DialogDescription>
                    미끼는 1개당 {BAIT_PRICE}골드입니다.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bait-quantity">구매 수량</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={normalizedQuantity <= 1 || isBuyingBait}
                        onClick={() => setQuantity((current) => current - 1)}
                        aria-label="미끼 수량 줄이기"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="bait-quantity"
                        type="number"
                        min={1}
                        step={1}
                        value={quantity}
                        disabled={isBuyingBait}
                        onChange={(event) =>
                          handleQuantityChange(event.target.value)
                        }
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isBuyingBait}
                        onClick={() => setQuantity((current) => current + 1)}
                        aria-label="미끼 수량 늘리기"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-sm">
                    <span className="inline-flex items-center gap-2 text-emerald-700">
                      <Fish className="h-4 w-4" />
                      총 구매 수량
                    </span>
                    <span className="font-semibold text-emerald-800">
                      {normalizedQuantity}개 / {totalCost}골드
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBuyingBait}
                    onClick={() => setIsBuyDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    disabled={isBuyingBait}
                    onClick={handleBuyBait}
                  >
                    {isBuyingBait ? "구매 중" : "구매하기"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-cyan-700">
                <BookOpen className="h-4 w-4" />
                해양도감
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                만난 친구들을 살펴봐요.
              </p>
            </div>
            <FishCodexDialog />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-xl border border-emerald-100 bg-white/80 px-6 py-5 text-center shadow-sm backdrop-blur">
          <p className="text-lg font-semibold text-emerald-700">
            낚시터 오픈 전입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
