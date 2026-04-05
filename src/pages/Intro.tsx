import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MousePointerClick, Keyboard } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const INTRO_PASSED_KEY = "harudam-intro-passed"

export function Intro() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  const goNext = useCallback(() => {
    if (isLoading) return

    window.sessionStorage.setItem(INTRO_PASSED_KEY, "true")
    navigate(isAuthenticated ? "/" : "/signin", { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      goNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goNext])

  return (
    <div
      className="app-intro-background relative flex min-h-screen cursor-pointer items-center justify-center overflow-hidden px-6 py-8 text-emerald-950"
      onClick={goNext}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.repeat) return
        goNext()
      }}
      aria-label="인트로 화면. 클릭하거나 아무 키를 누르면 다음 화면으로 이동합니다"
    >
      {/* background glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-lime-100/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-green-100/70 blur-3xl" />

      {/* logo / brand */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-md sm:top-8 sm:left-8">
        <img
          src="/logo.png"
          alt="하루,담 로고"
          className="h-11 w-11 rounded-2xl object-cover shadow-sm"
        />
        <div className="flex flex-col leading-none">
          <span className="text-xs font-medium tracking-[0.2em] text-emerald-700/70 uppercase">
            Haru,dam
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl">
            하루,담
          </h1>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        {/* main card */}
        <div className="w-full rounded-[2rem]">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] text-emerald-700/70 uppercase">
              오늘의 순간을 차곡차곡
            </p>

            <p
              className="text-3xl leading-tight font-semibold tracking-tight text-emerald-950 sm:text-5xl"
              aria-label="당신의 하루하루를, 담아보세요"
            >
              <span className="block">
                당신의{" "}
                <strong className="text-5xl text-green-600 sm:text-7xl">
                  하루
                </strong>
                하루를
              </span>

              <span className="mt-2 block">
                <strong className="px-1 text-5xl text-green-600 sm:text-7xl">
                  ,
                </strong>
                <span className="inline-block">
                  <strong className="text-5xl text-green-600 sm:text-7xl">
                    담
                  </strong>
                  아보세요
                </span>
              </span>
            </p>
          </div>
        </div>

        {/* bottom hint */}
        <div className="mt-8 flex animate-pulse items-center gap-2 rounded-full bg-emerald-950 px-4 py-2 text-sm text-white/90 shadow-lg">
          <MousePointerClick className="h-4 w-4" />
          <Keyboard className="h-4 w-4" />
          <span>클릭하거나 아무 키를 누르면 시작돼요</span>
        </div>
      </div>
    </div>
  )
}

export default Intro
