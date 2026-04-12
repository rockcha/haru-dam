import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import type {
  DailyTask,
  CreateDailyTaskPayload,
  UpdateDailyTaskPayload,
} from "@/types/daily-task"

const supabase = createClient()

const DAILY_TASKS_QUERY_KEY = ["daily-tasks"] as const
const INCOMPLETE_DAILY_TASKS_QUERY_KEY = ["daily-tasks", "incomplete"] as const

const getRequiredUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw new Error(error.message)
  if (!user) throw new Error("로그인이 필요합니다")

  return user
}

// ============= API Functions =============

/**
 * 모든 일일 과제 조회
 */
export async function fetchDailyTasks(): Promise<DailyTask[]> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * 특정 일일 과제 조회
 */
export async function fetchDailyTaskById(id: string): Promise<DailyTask> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * 완료되지 않은 일일 과제만 조회
 */
export async function fetchIncompleteDailyTasks(): Promise<DailyTask[]> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_done", false)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * 일일 과제 추가
 */
export async function createDailyTask(
  payload: CreateDailyTaskPayload
): Promise<DailyTask> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("daily_tasks")
    .insert([
      {
        user_id: user.id,
        content: payload.content,
        is_done: payload.is_done ?? false,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * 일일 과제 수정
 */
export async function updateDailyTask(
  id: string,
  payload: UpdateDailyTaskPayload
): Promise<DailyTask> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("daily_tasks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * 일일 과제 완료 상태 토글
 */
export async function toggleDailyTaskDone(id: string): Promise<DailyTask> {
  const task = await fetchDailyTaskById(id)
  return updateDailyTask(id, { is_done: !task.is_done })
}

/**
 * 일일 과제 삭제
 */
export async function deleteDailyTask(id: string): Promise<void> {
  const user = await getRequiredUser()

  const { error } = await supabase
    .from("daily_tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
}

// ============= Helpers =============

function sortByCreatedAtDesc(tasks: DailyTask[]) {
  return [...tasks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

function filterIncomplete(tasks: DailyTask[]) {
  return tasks.filter((task) => !task.is_done)
}

// ============= React Query Hooks =============

/**
 * 모든 일일 과제 조회 훅
 */
export function useDailyTasks(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DAILY_TASKS_QUERY_KEY,
    queryFn: fetchDailyTasks,
    staleTime: 1000 * 60 * 60,
    enabled: options?.enabled,
  })
}

/**
 * 특정 일일 과제 조회 훅
 */
export function useDailyTask(id: string) {
  return useQuery({
    queryKey: [...DAILY_TASKS_QUERY_KEY, id],
    queryFn: () => fetchDailyTaskById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  })
}

/**
 * 완료되지 않은 일일 과제만 조회 훅
 */
export function useIncompleteDailyTasks() {
  return useQuery({
    queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
    queryFn: fetchIncompleteDailyTasks,
    staleTime: 1000 * 60 * 60,
  })
}

/**
 * 일일 과제 추가 훅
 */
export function useCreateDailyTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDailyTask,

    onMutate: async (newTaskPayload) => {
      await queryClient.cancelQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      await queryClient.cancelQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })

      const previousDailyTasks =
        queryClient.getQueryData<DailyTask[]>(DAILY_TASKS_QUERY_KEY) || []

      const previousIncompleteDailyTasks =
        queryClient.getQueryData<DailyTask[]>(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY
        ) || []

      const optimisticTask: DailyTask = {
        id: `temp-${Date.now()}`,
        user_id: "temp-user",
        content: newTaskPayload.content,
        is_done: newTaskPayload.is_done ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const nextDailyTasks = sortByCreatedAtDesc([
        optimisticTask,
        ...previousDailyTasks,
      ])

      queryClient.setQueryData<DailyTask[]>(
        DAILY_TASKS_QUERY_KEY,
        nextDailyTasks
      )

      queryClient.setQueryData<DailyTask[]>(
        INCOMPLETE_DAILY_TASKS_QUERY_KEY,
        filterIncomplete(nextDailyTasks)
      )

      return {
        previousDailyTasks,
        previousIncompleteDailyTasks,
        optimisticTaskId: optimisticTask.id,
      }
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousDailyTasks) {
        queryClient.setQueryData(
          DAILY_TASKS_QUERY_KEY,
          context.previousDailyTasks
        )
      }

      if (context?.previousIncompleteDailyTasks) {
        queryClient.setQueryData(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY,
          context.previousIncompleteDailyTasks
        )
      }

      toast.error(error.message || "일일 과제 추가에 실패했습니다")
    },

    onSuccess: (createdTask, _variables, context) => {
      const currentDailyTasks =
        queryClient.getQueryData<DailyTask[]>(DAILY_TASKS_QUERY_KEY) || []

      const replacedDailyTasks = currentDailyTasks.map((task) =>
        task.id === context?.optimisticTaskId ? createdTask : task
      )

      queryClient.setQueryData<DailyTask[]>(
        DAILY_TASKS_QUERY_KEY,
        sortByCreatedAtDesc(replacedDailyTasks)
      )

      queryClient.setQueryData<DailyTask[]>(
        INCOMPLETE_DAILY_TASKS_QUERY_KEY,
        filterIncomplete(sortByCreatedAtDesc(replacedDailyTasks))
      )

      toast.success("일일 과제가 추가되었습니다")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })
    },
  })
}

/**
 * 일일 과제 수정 훅
 */
export function useUpdateDailyTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateDailyTaskPayload
    }) => updateDailyTask(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      await queryClient.cancelQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })

      const previousDailyTasks =
        queryClient.getQueryData<DailyTask[]>(DAILY_TASKS_QUERY_KEY) || []

      const previousIncompleteDailyTasks =
        queryClient.getQueryData<DailyTask[]>(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY
        ) || []

      const nextDailyTasks = previousDailyTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...payload,
              updated_at: new Date().toISOString(),
            }
          : task
      )

      queryClient.setQueryData<DailyTask[]>(
        DAILY_TASKS_QUERY_KEY,
        sortByCreatedAtDesc(nextDailyTasks)
      )

      queryClient.setQueryData<DailyTask[]>(
        INCOMPLETE_DAILY_TASKS_QUERY_KEY,
        filterIncomplete(nextDailyTasks)
      )

      return {
        previousDailyTasks,
        previousIncompleteDailyTasks,
      }
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousDailyTasks) {
        queryClient.setQueryData(
          DAILY_TASKS_QUERY_KEY,
          context.previousDailyTasks
        )
      }

      if (context?.previousIncompleteDailyTasks) {
        queryClient.setQueryData(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY,
          context.previousIncompleteDailyTasks
        )
      }

      toast.error(error.message || "일일 과제 수정에 실패했습니다")
    },

    onSuccess: (updatedTask) => {
      const currentDailyTasks =
        queryClient.getQueryData<DailyTask[]>(DAILY_TASKS_QUERY_KEY) || []

      const syncedDailyTasks = currentDailyTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )

      queryClient.setQueryData<DailyTask[]>(
        DAILY_TASKS_QUERY_KEY,
        sortByCreatedAtDesc(syncedDailyTasks)
      )

      queryClient.setQueryData<DailyTask[]>(
        INCOMPLETE_DAILY_TASKS_QUERY_KEY,
        filterIncomplete(syncedDailyTasks)
      )

      toast.success("일일 과제가 수정되었습니다")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })
    },
  })
}

/**
 * 일일 과제 완료 상태 토글 훅
 */
export function useToggleDailyTaskDone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleDailyTaskDone,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      await queryClient.cancelQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })

      const previousDailyTasks =
        queryClient.getQueryData<DailyTask[]>(DAILY_TASKS_QUERY_KEY) || []

      const previousIncompleteDailyTasks =
        queryClient.getQueryData<DailyTask[]>(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY
        ) || []

      const nextDailyTasks = previousDailyTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              is_done: !task.is_done,
              updated_at: new Date().toISOString(),
            }
          : task
      )

      queryClient.setQueryData<DailyTask[]>(
        DAILY_TASKS_QUERY_KEY,
        sortByCreatedAtDesc(nextDailyTasks)
      )

      queryClient.setQueryData<DailyTask[]>(
        INCOMPLETE_DAILY_TASKS_QUERY_KEY,
        filterIncomplete(nextDailyTasks)
      )

      return {
        previousDailyTasks,
        previousIncompleteDailyTasks,
      }
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousDailyTasks) {
        queryClient.setQueryData(
          DAILY_TASKS_QUERY_KEY,
          context.previousDailyTasks
        )
      }

      if (context?.previousIncompleteDailyTasks) {
        queryClient.setQueryData(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY,
          context.previousIncompleteDailyTasks
        )
      }

      toast.error(error.message || "상태 변경에 실패했습니다")
    },

    onSuccess: (updatedTask) => {
      const currentDailyTasks =
        queryClient.getQueryData<DailyTask[]>(DAILY_TASKS_QUERY_KEY) || []

      const syncedDailyTasks = currentDailyTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )

      queryClient.setQueryData<DailyTask[]>(
        DAILY_TASKS_QUERY_KEY,
        sortByCreatedAtDesc(syncedDailyTasks)
      )

      queryClient.setQueryData<DailyTask[]>(
        INCOMPLETE_DAILY_TASKS_QUERY_KEY,
        filterIncomplete(syncedDailyTasks)
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })
    },
  })
}

/**
 * 일일 과제 삭제 훅
 */
export function useDeleteDailyTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDailyTask,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      await queryClient.cancelQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })

      const previousDailyTasks =
        queryClient.getQueryData<DailyTask[]>(DAILY_TASKS_QUERY_KEY) || []

      const previousIncompleteDailyTasks =
        queryClient.getQueryData<DailyTask[]>(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY
        ) || []

      const nextDailyTasks = previousDailyTasks.filter((task) => task.id !== id)

      queryClient.setQueryData<DailyTask[]>(
        DAILY_TASKS_QUERY_KEY,
        sortByCreatedAtDesc(nextDailyTasks)
      )

      queryClient.setQueryData<DailyTask[]>(
        INCOMPLETE_DAILY_TASKS_QUERY_KEY,
        filterIncomplete(nextDailyTasks)
      )

      return {
        previousDailyTasks,
        previousIncompleteDailyTasks,
      }
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousDailyTasks) {
        queryClient.setQueryData(
          DAILY_TASKS_QUERY_KEY,
          context.previousDailyTasks
        )
      }

      if (context?.previousIncompleteDailyTasks) {
        queryClient.setQueryData(
          INCOMPLETE_DAILY_TASKS_QUERY_KEY,
          context.previousIncompleteDailyTasks
        )
      }

      toast.error(error.message || "일일 과제 삭제에 실패했습니다")
    },

    onSuccess: () => {
      toast.success("일일 과제가 삭제되었습니다")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_TASKS_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: INCOMPLETE_DAILY_TASKS_QUERY_KEY,
      })
    },
  })
}
