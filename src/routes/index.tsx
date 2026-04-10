import type { RouteObject } from "react-router-dom"
import SignUp from "@/pages/SignUp"
import SignIn from "@/pages/SignIn"
import Schedule from "@/pages/Schedule"
import Diaries from "@/pages/Diaries"
import DiaryNew from "@/pages/DiaryNew"
import DiaryDetail from "@/pages/DiaryDetail"
import MusicRoom from "@/pages/MusicRoom"
import Fishing from "@/pages/Fishing"
import NotFound from "@/pages/NotFound"
import Intro from "@/pages/Intro"
import RootEntry from "@/pages/RootEntry"
import GlobalLayout from "@/layout/GlobalLayout"
import { PrivateRoute } from "@/components/PrivateRoute"

export const routes: RouteObject[] = [
  {
    path: "/intro",
    element: <Intro />,
  },
  {
    element: <GlobalLayout />,
    children: [
      {
        path: "/",
        element: <RootEntry />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/signin",
        element: <SignIn />,
      },
      {
        path: "/schedule",
        element: (
          <PrivateRoute>
            <Schedule />
          </PrivateRoute>
        ),
      },
      {
        path: "/diaries",
        element: (
          <PrivateRoute>
            <Diaries />
          </PrivateRoute>
        ),
      },
      {
        path: "/diary/new",
        element: (
          <PrivateRoute>
            <DiaryNew />
          </PrivateRoute>
        ),
      },
      {
        path: "/diary/:id",
        element: (
          <PrivateRoute>
            <DiaryDetail />
          </PrivateRoute>
        ),
      },
      {
        path: "/musicroom",
        element: (
          <PrivateRoute>
            <MusicRoom />
          </PrivateRoute>
        ),
      },
      {
        path: "/fishing",
        element: (
          <PrivateRoute>
            <Fishing />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]
