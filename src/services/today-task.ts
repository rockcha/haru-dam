import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import type {
  TodayTask,
  CreateTodayTaskInput,
  UpdateTodayTaskInput,
} from "@/types/today-task"

const supabase = createClient()

const TODAY_TASKS_QUERY_KEY = ["today-tasks"] as const

function getTodayTasksQueryKey() {
  return [...TODAY_TASKS_QUERY_KEY, "all"] as const
}

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

export async function fetchTodayTasks(): Promise<TodayTask[]> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("today_tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createTodayTask(
  payload: CreateTodayTaskInput
): Promise<TodayTask> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("today_tasks")
    .insert([
      {
        user_id: user.id,
        date: payload.date,
        content: payload.content,
        is_done: payload.is_done ?? false,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateTodayTask(
  id: string,
  payload: Omit<UpdateTodayTaskInput, "id">
): Promise<TodayTask> {
  const user = await getRequiredUser()

  const { data, error } = await supabase
    .from("today_tasks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteTodayTask(id: string): Promise<void> {
  const user = await getRequiredUser()

  const { error } = await supabase
    .from("today_tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
}

// ============= Helpers =============

function sortByCreatedAtDesc(tasks: TodayTask[]) {
  return [...tasks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

// ============= React Query Hooks =============

export function useTodayTasks(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: getTodayTasksQueryKey(),
    queryFn: fetchTodayTasks,
    staleTime: 1000 * 60 * 60,
    enabled: options?.enabled,
  })
}

export function useCreateTodayTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodayTask,

    onMutate: async (newTaskPayload) => {
      await queryClient.cancelQueries({
        queryKey: getTodayTasksQueryKey(),
      })

      const previousTodayTasks =
        queryClient.getQueryData<TodayTask[]>(getTodayTasksQueryKey()) || []

      const optimisticTask: TodayTask = {
        id: `temp-${Date.now()}`,
        user_id: "temp-user",
        date: newTaskPayload.date,
        content: newTaskPayload.content,
        is_done: newTaskPayload.is_done ?? false,
        created_at: new Date().toISOString(),
      }

      const nextTodayTasks = sortByCreatedAtDesc([
        optimisticTask,
        ...previousTodayTasks,
      ])

      queryClient.setQueryData<TodayTask[]>(
        getTodayTasksQueryKey(),
        nextTodayTasks
      )

      return {
        previousTodayTasks,
        optimisticTaskId: optimisticTask.id,
      }
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousTodayTasks) {
        queryClient.setQueryData(
          getTodayTasksQueryKey(),
          context.previousTodayTasks
        )
      }

      toast.error(error.message || "오늘 할 일 추가에 실패했습니다")
    },

    onSuccess: (createdTask, _variables, context) => {
      const currentTodayTasks =
        queryClient.getQueryData<TodayTask[]>(getTodayTasksQueryKey()) || []

      const replacedTasks = currentTodayTasks.map((task) =>
        task.id === context?.optimisticTaskId ? createdTask : task
      )

      queryClient.setQueryData<TodayTask[]>(
        getTodayTasksQueryKey(),
        sortByCreatedAtDesc(replacedTasks)
      )

      toast.success("오늘 할 일이 추가되었습니다")
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getTodayTasksQueryKey(),
      })
    },
  })
}

export function useUpdateTodayTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Omit<UpdateTodayTaskInput, "id">
    }) => updateTodayTask(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({
        queryKey: getTodayTasksQueryKey(),
      })

      const previousTodayTasks =
        queryClient.getQueryData<TodayTask[]>(getTodayTasksQueryKey()) || []

      const nextTodayTasks = previousTodayTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...payload,
            }
          : task
      )

      queryClient.setQueryData<TodayTask[]>(
        getTodayTasksQueryKey(),
        sortByCreatedAtDesc(nextTodayTasks)
      )

      return {
        previousTodayTasks,
      }
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousTodayTasks) {
        queryClient.setQueryData(
          getTodayTasksQueryKey(),
          context.previousTodayTasks
        )
      }

      toast.error(error.message || "오늘 할 일 수정에 실패했습니다")
    },

    onSuccess: (updatedTask) => {
      const currentTodayTasks =
        queryClient.getQueryData<TodayTask[]>(getTodayTasksQueryKey()) || []

      const syncedTasks = currentTodayTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )

      queryClient.setQueryData<TodayTask[]>(
        getTodayTasksQueryKey(),
        sortByCreatedAtDesc(syncedTasks)
      )

      toast.success("오늘 할 일이 수정되었습니다")
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getTodayTasksQueryKey(),
      })
    },
  })
}

export function useDeleteTodayTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTodayTask,

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: getTodayTasksQueryKey(),
      })

      const previousTodayTasks =
        queryClient.getQueryData<TodayTask[]>(getTodayTasksQueryKey()) || []

      const nextTodayTasks = previousTodayTasks.filter((task) => task.id !== id)

      queryClient.setQueryData<TodayTask[]>(
        getTodayTasksQueryKey(),
        sortByCreatedAtDesc(nextTodayTasks)
      )

      return {
        previousTodayTasks,
      }
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousTodayTasks) {
        queryClient.setQueryData(
          getTodayTasksQueryKey(),
          context.previousTodayTasks
        )
      }

      toast.error(error.message || "오늘 할 일 삭제에 실패했습니다")
    },

    onSuccess: () => {
      toast.success("오늘 할 일이 삭제되었습니다")
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getTodayTasksQueryKey(),
      })
    },
  })
}
