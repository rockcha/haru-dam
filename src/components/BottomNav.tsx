import { useNavigate, useLocation } from "react-router-dom"
import { Home, BookOpen, Music2, CalendarDays } from "lucide-react"
import { Dock, DockIcon } from "@/components/ui/dock"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "홈", path: "/", icon: Home },
  { label: "스케줄러", path: "/schedule", icon: CalendarDays },
  { label: "일기장", path: "/diaries", icon: BookOpen },
  { label: "뮤직룸", path: "/musicroom", icon: Music2 },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <Dock
        iconSize={44}
        iconMagnification={64}
        iconDistance={120}
        className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl"
      >
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive =
            path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(path)
          return (
            <Tooltip key={path}>
              <TooltipTrigger asChild>
                <DockIcon
                  onClick={() => navigate(path)}
                  className={cn(
                    "rounded-full transition-colors duration-200 hover:bg-emerald-100",
                    isActive && "bg-emerald-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 transition-colors duration-200",
                      isActive ? "text-emerald-600" : "text-gray-500"
                    )}
                  />
                </DockIcon>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </Dock>
    </div>
  )
}

export default BottomNav
