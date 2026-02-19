"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Timer, CalendarDays, LogOut } from "lucide-react"
import { toast } from "sonner"

export default function FuncoesPage() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    toast.success("Logout realizado")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="logo-metal relative w-[294px] h-[294px]">
          <Image
            src="/images/logo.png"
            alt="The Lord Barber"
            fill
            className="object-contain"
            priority
          />
          <div className="metal-overlay" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-[0.2em] text-primary uppercase">
          FUNCOES
        </h1>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-4">
        <button
          onClick={() => router.push("/timer-out")}
          className="w-full h-16 bg-card border border-border rounded-lg font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-3 text-foreground hover:border-primary hover:bg-primary/5 transition-all"
        >
          <Timer className="h-5 w-5 text-primary" />
          Timer-Out
        </button>

        <button
          onClick={() => router.push("/agendamento")}
          className="w-full h-16 bg-card border border-border rounded-lg font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-3 text-foreground hover:border-primary hover:bg-primary/5 transition-all"
        >
          <CalendarDays className="h-5 w-5 text-primary" />
          Sistema Agendamento
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </main>
  )
}
