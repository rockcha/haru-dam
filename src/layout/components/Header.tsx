import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TypingAnimation } from "@/components/ui/typing-animation"
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
import { ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
// import {
//   useMyBgTheme,
//   useThemeColors,
//   useUpdateMyBgTheme,
// } from "@/services/bg-theme"

const Header = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, signOut } = useAuth()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

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
    } catch (err: any) {
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
      <header className="fixed top-0 z-10 flex h-18 w-full max-w-7xl items-center justify-between border-b border-black/5 bg-white/90 px-4">
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="ease text-2xl transition duration-300 hover:scale-105 sm:text-3xl"
          >
            하루,담
          </Link>

          <TypingAnimation
            words={["하루하루를 ", "담아내세요", "하루,담"]}
            loop
            typeSpeed={100}
            deleteSpeed={150}
            pauseDelay={2500}
            className="sm:text-md text-sm font-medium text-primary"
          />
        </div>

        <div className="flex items-center">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="flex cursor-pointer items-center gap-1"
                  >
                    <span>⚡{displayName}님</span>
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
