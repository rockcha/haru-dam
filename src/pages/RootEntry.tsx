import { Navigate } from "react-router-dom"
import Home from "@/pages/Home"
import { PrivateRoute } from "@/components/PrivateRoute"

const INTRO_PASSED_KEY = "harudam-intro-passed"

export function RootEntry() {
  const isIntroPassed =
    window.sessionStorage.getItem(INTRO_PASSED_KEY) === "true"

  if (!isIntroPassed) {
    return <Navigate to="/intro" replace />
  }

  return (
    <PrivateRoute>
      <Home />
    </PrivateRoute>
  )
}

export default RootEntry
