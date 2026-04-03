import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div>
          <p className="text-6xl font-semibold tracking-tight text-foreground">
            404
          </p>

          <div className="mt-4 space-y-2">
            <p className="text-base font-medium text-foreground">
              페이지를 찾을 수 없어요
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              준비되지 않았거나 존재하지 않는 페이지입니다.
            </p>
          </div>

          <Button onClick={() => navigate("/")} className="mt-8 min-w-28">
            홈으로
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
