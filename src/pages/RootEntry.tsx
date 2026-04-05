import { Navigate } from "react-router-dom"
import Home from "@/pages/Home"
import { PrivateRoute } from "@/components/PrivateRoute"

const INTRO_SEEN_KEY = "harudam-intro-seen"

export function RootEntry() {
  const isIntroSeen = window.localStorage.getItem(INTRO_SEEN_KEY) === "true"

  if (!isIntroSeen) {
    return <Navigate to="/intro" replace />
  }

  return (
    <PrivateRoute>
      <Home />
    </PrivateRoute>
  )
}

export default RootEntry
