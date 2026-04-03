import type { RouteObject } from "react-router-dom"
import Home from "@/pages/Home"
import SignUp from "@/pages/SignUp"
import SignIn from "@/pages/SignIn"
import Schedule from "@/pages/Schedule"
import NotFound from "@/pages/NotFound"
import GlobalLayout from "@/layout/GlobalLayout"
import { PrivateRoute } from "@/components/PrivateRoute"

export const routes: RouteObject[] = [
  {
    element: <GlobalLayout />,
    children: [
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
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
