import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/context/AuthContext"
import { MusicPlayerProvider } from "@/context/MusicPlayerContext"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "./components/ui/tooltip.tsx"
import { queryClient } from "@/lib/queryClient"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="harudam-theme">
        <BrowserRouter>
          <AuthProvider>
            <MusicPlayerProvider>
              <TooltipProvider>
                <App />
              </TooltipProvider>

              <Toaster />
            </MusicPlayerProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
