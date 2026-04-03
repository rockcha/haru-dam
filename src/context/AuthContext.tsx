import { createContext, useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()
  const queryClient = useQueryClient()

  const formatUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name:
      supabaseUser.user_metadata?.name ??
      supabaseUser.email?.split("@")[0] ??
      "",
  })

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session?.user) {
          setUser(formatUser(session.user))
        }
      } catch (error) {
        console.error("초기 세션 조회 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(formatUser(session.user))
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        if (data.user) {
          setUser(formatUser(data.user))
          toast.success("로그인되었어요.")
        }
      } catch (error) {
        console.error("로그인 실패:", error)
        toast.error("로그인에 실패했어요. 이메일과 비밀번호를 확인해주세요.")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [supabase.auth]
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split("@")[0],
            },
          },
        })

        if (error) {
          throw error
        }

        if (data.user) {
          setUser(formatUser(data.user))
          toast.success("회원가입이 완료되었어요.")
        }
      } catch (error) {
        console.error("회원가입 실패:", error)
        toast.error("회원가입에 실패했어요. 잠시 후 다시 시도해주세요.")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [supabase.auth]
  )

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)

      // 유저 관련 React Query 캐시 전체 정리
      queryClient.clear()

      toast.success("로그아웃되었어요.")
    } catch (error) {
      console.error("로그아웃 실패:", error)
      toast.error("로그아웃에 실패했어요.")
      throw error
    }
  }, [supabase.auth, queryClient])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
