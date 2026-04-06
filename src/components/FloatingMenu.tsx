import { useNavigate, useLocation } from "react-router-dom"
import { Menu } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"

const menus = [
  { label: "홈", path: "/", emoji: "🏠", requiresAuth: false },
  { label: "달력", path: "/schedule", emoji: "📆", requiresAuth: true },
  { label: "일기장", path: "/diaries", emoji: "📔", requiresAuth: true },
  { label: "뮤직룸", path: "/musicroom", emoji: "🎵", requiresAuth: true },
  {
    label: "개발자 노트 (준비 중)",
    path: "/dev-note",
    emoji: "💻",
    requiresAuth: true,
  },
  { label: "광장 (준비 중)", path: "/square", emoji: "🌿", requiresAuth: true },
  {
    label: "건의함 (준비 중)",
    path: "/suggest",
    emoji: "📮",
    requiresAuth: true,
  },
]

const FloatingMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const handleMenuClick = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      toast.warning("로그인해야 사용할 수 있는 기능이에요.")
      return
    }

    navigate(path)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg transition hover:scale-105 hover:bg-emerald-600 active:scale-95"
          aria-label="메뉴 열기"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-70 border-r bg-white px-4 py-6">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="flex flex-col">
              <div className="flex items-center">
                {" "}
                <span className="text-3xl">하루,담</span>
                <img
                  src="/logo.png"
                  alt="하루,담 로고"
                  className="h-12 w-12 object-cover"
                />
              </div>

              <span className="text-xs font-normal text-muted-foreground">
                하루하루를 담아내요
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1.5">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path

            return (
              <button
                key={menu.path}
                type="button"
                onClick={() => handleMenuClick(menu.path, menu.requiresAuth)}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] ${
                  isActive
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
                }`}
              >
                <span className="rounded-full bg-white p-2 text-lg transition-transform duration-200 group-hover:scale-110">
                  {menu.emoji}
                </span>
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  {menu.label}
                </span>
              </button>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default FloatingMenu
