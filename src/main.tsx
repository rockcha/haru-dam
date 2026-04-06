import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import App from "./App.tsx"
import { AuthProvider } from "@/context/AuthContext"
import { MusicPlayerProvider } from "@/context/MusicPlayerContext"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "./components/ui/tooltip.tsx"
import { queryClient } from "@/lib/queryClient"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </StrictMode>
)
