import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { Highlighter } from "@/components/ui/highlighter"

export function SignIn() {
  const navigate = useNavigate()
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await signIn(email, password)

      navigate("/")
    } catch (err: any) {
      const errorMessage = err?.message || "로그인에 실패했습니다"
      setError(errorMessage)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            로그인 후,{" "}
            <Highlighter
              animationDuration={2000}
              action="highlight"
              color="#A8E6CF"
            >
              하루를 담아보세요
            </Highlighter>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  variant={"link"}
                  disabled
                >
                  비밀번호 찾기
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            계정이 없으신가요?{" "}
            <Button onClick={() => navigate("/signup")} variant={"link"}>
              회원가입
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn
 