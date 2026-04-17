import { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ChevronDown,
  UserRound,
  Home,
  BookOpen,
  Headphones,
  CalendarDays,
  Coins,
  Waves,
  Fish,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import HeaderMusicDropdown from "./HeaderMusicDropdown"
import { toast } from "sonner"
import { useMyGold } from "@/services/gold"
import { Separator } from "@/components/ui/separator"
// import {
//   useMyBgTheme,
//   useThemeColors,
//   useUpdateMyBgTheme,
// } from "@/services/bg-theme"

const NAV_ITEMS = [
  { label: "홈", path: "/", icon: Home },
  { label: "스케줄러", path: "/schedule", icon: CalendarDays },
  { label: "일기장", path: "/diaries", icon: BookOpen },
  { label: "뮤직룸", path: "/musicroom", icon: Headphones },
  { label: "아쿠아리움", path: "/aquarium", icon: Fish },
  { label: "낚시터", path: "/fishing", icon: Waves },
]

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, signOut } = useAuth()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const { data: goldAmount = 0 } = useMyGold(isAuthenticated)

  // const { data: themeColors = [] } = useThemeColors()
  // const { data: myBgTheme } = useMyBgTheme()
  // const { mutate: updateMyBgTheme, isPending: isThemeUpdating } =
  //   useUpdateMyBgTheme()

  const displayName = user?.name || user?.email || "사용자"

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("로그아웃되었습니다")
      navigate("/signin")
      setIsLogoutDialogOpen(false)
    } catch (err: unknown) {
      toast.error("로그아웃에 실패했습니다")
      console.error("Logout error:", err)
    }
  }

  // const handleThemeChange = (colorId: number) => {
  //   if (myBgTheme?.color_id === colorId || isThemeUpdating) return
  //   updateMyBgTheme({ color_id: colorId })
  // }

  return (
    <>
      <header className="fixed top-0 z-10 flex h-18 w-full max-w-7xl items-center justify-between border-b border-black/5 bg-white/90 px-2">
        {/* 좌측: 로고 */}
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="ease flex items-center gap-2 text-2xl transition duration-300 hover:scale-105 sm:text-3xl"
          >
            <img
              src="/logo.png"
              alt="하루담 로고"
              className="h-8 w-8 object-contain sm:h-10 sm:w-10"
            />

            <span>하루,담</span>
          </Link>
        </div>

        {/* 중앙: 네비게이션 (데스크톱에서만 보임) */}
        <div className="hidden gap-2 md:flex">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path)
            return (
              <Tooltip key={path}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(path)}
                    className={cn(
                      "cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-emerald-100",
                      isActive && "bg-emerald-100"
                    )}
                    aria-label={label}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isActive ? "text-emerald-600" : "text-gray-500"
                      )}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* 배경 테마 기능 임시 비활성화 */}
              {/*
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    aria-label="배경 테마 색상 선택"
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isThemeUpdating}
                  >
                    <span className="sr-only">배경색 선택</span>
                    🎨
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-64 rounded-2xl border bg-white p-3 shadow-lg backdrop-blur"
                >
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="text-sm">🎨</span>
                    <p className="text-sm font-semibold text-gray-700">
                      배경 테마
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {themeColors.map((theme) => {
                      const isSelected = myBgTheme?.color_id === theme.id

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleThemeChange(theme.id)}
                          disabled={isThemeUpdating}
                          className={`relative h-10 w-10 cursor-pointer rounded-full border transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
                            isSelected
                              ? "ring-2 ring-primary"
                              : "border-black/10"
                          }`}
                          style={{ backgroundColor: theme.color }}
                          title={theme.color}
                        >
                          {isSelected ? (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check className="h-5 w-5 text-green-700" />
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>

                  <p className="mt-3 px-1 text-xs text-muted-foreground">
                    원하는 배경색을 선택해보세요
                  </p>
                </DropdownMenuContent>
              </DropdownMenu>
              */}

              <HeaderMusicDropdown />

              <Separator orientation="vertical" className="h-5" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-full px-2 py-1 text-amber-600">
                    <Coins className="h-4 w-4" />
                    <span className="text-sm font-semibold">{goldAmount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                  출석체크와 일기 작성으로 골드를 얻을 수 있어요.
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-5" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="flex cursor-pointer items-center gap-1"
                  >
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-4 w-4" />
                      {displayName}님
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-40 rounded-xl border bg-white p-1 shadow-md"
                >
                  <DropdownMenuItem
                    onClick={() => navigate("/")}
                    className="cursor-pointer rounded-lg text-gray-700 transition outline-none hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700"
                  >
                    홈
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => navigate("/mypage")}
                    className="cursor-pointer rounded-lg text-gray-700 transition outline-none hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700"
                  >
                    마이페이지
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="cursor-pointer rounded-lg text-red-500 transition outline-none hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
                  >
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={() => navigate("/signin")}
            >
              로그인
            </Button>
          )}
        </div>
      </header>

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              로그아웃 후 다시 로그인해야 합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              로그아웃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Header
