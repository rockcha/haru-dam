import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import FloatingMenu from "@/components/FloatingMenu"
import DeveloperNotesPopup from "@/components/DeveloperNotesPopup"
import BottomNav from "@/components/BottomNav"
const GlobalLayout = () => {
  return (
    <div className="app-intro-background mx-auto flex min-h-screen w-full max-w-7xl flex-col transition-colors duration-300">
      <Header />

      <main className="flex-1 pt-18 pb-28">
        <Outlet />
      </main>
      <DeveloperNotesPopup />
      <FloatingMenu />
      <BottomNav />
    </div>
  )
}

export default GlobalLayout
