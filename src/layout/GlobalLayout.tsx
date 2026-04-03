import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import FloatingMenu from "@/components/FloatingMenu"
import { useMyBgTheme } from "@/services/bg-theme"
import DeveloperNotesPopup from "@/components/DeveloperNotesPopup"
const GlobalLayout = () => {
  const { data: myBgTheme } = useMyBgTheme()

  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-7xl flex-col transition-colors duration-300"
      style={{ backgroundColor: myBgTheme?.theme_color.color ?? "#fafafa" }}
    >
      <Header />

      <main className="flex-1 pt-18">
        <Outlet />
      </main>
      <DeveloperNotesPopup />
      <FloatingMenu />
    </div>
  )
}

export default GlobalLayout
