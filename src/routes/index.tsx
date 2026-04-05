import type { RouteObject } from "react-router-dom"
import SignUp from "@/pages/SignUp"
import SignIn from "@/pages/SignIn"
import Schedule from "@/pages/Schedule"
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
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]
