import { Waves } from "lucide-react"

export default function Aquarium() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-md border border-cyan-100 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="relative h-72 overflow-hidden rounded-md border-4 border-cyan-200 bg-linear-to-b from-cyan-50 via-sky-50 to-teal-50">
          <div className="absolute inset-x-0 top-0 h-12 bg-white/40" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-teal-100/80 to-transparent" />

          <div className="absolute bottom-4 left-8 h-10 w-24 rounded-[50%] bg-zinc-200/80" />
          <div className="absolute right-10 bottom-5 h-8 w-20 rounded-[50%] bg-zinc-300/70" />
          <div className="absolute bottom-4 left-1/2 h-12 w-12 -translate-x-1/2 rounded-[45%] bg-zinc-200/70" />

          <div className="absolute bottom-10 left-14 h-14 w-2 rounded-full bg-emerald-300/70" />
          <div className="absolute bottom-10 left-20 h-20 w-2 rounded-full bg-teal-300/70" />
          <div className="absolute right-20 bottom-10 h-16 w-2 rounded-full bg-emerald-300/70" />
          <div className="absolute right-14 bottom-10 h-10 w-2 rounded-full bg-teal-300/70" />

          <div className="absolute top-16 left-16 h-3 w-3 rounded-full border border-cyan-200 bg-white/50" />
          <div className="absolute top-24 left-24 h-2 w-2 rounded-full border border-cyan-200 bg-white/50" />
          <div className="absolute top-12 right-28 h-4 w-4 rounded-full border border-cyan-200 bg-white/50" />
          <div className="absolute top-28 right-20 h-2.5 w-2.5 rounded-full border border-cyan-200 bg-white/50" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-md bg-white/75 p-3 text-cyan-700 shadow-sm">
              <Waves className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-semibold text-cyan-800">
                빈 수조
              </p>
              <p className="mt-1 text-sm text-cyan-700">
                수조 정리중입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
