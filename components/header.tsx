"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User, Moon, Sun } from "lucide-react"
import { Developer } from "@/lib/types"

interface HeaderProps {
  developer: Developer | null
  onLoginClick: () => void
  onLogout: () => void
}

export function Header({ developer, onLoginClick, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground">Fluxos de Automação Medical Spin</h1>
            <p className="text-xs text-muted-foreground">Visualizador e Documentação</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          {developer ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground hidden sm:inline">
                  {developer.name}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={onLoginClick}>
              <LogIn className="h-4 w-4 mr-2" />
              Entrar como Desenvolvedor
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
