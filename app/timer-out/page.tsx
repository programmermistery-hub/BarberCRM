"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Search, Clock, User, Phone } from "lucide-react"

interface TimerOutEntry {
  nome: string
  numero: string
  ultimo_agendamento: string
  dias_timer_out: number
}

export default function TimerOutPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [data, setData] = useState<TimerOutEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async (query: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/timer-out?search=${encodeURIComponent(query)}`)
      const result = await res.json()
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(search)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, fetchData])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchData(search), 30000)
    return () => clearInterval(interval)
  }, [search, fetchData])

  function getBadgeColor(dias: number) {
    if (dias > 30) return "bg-[oklch(0.55_0.2_25)] text-[oklch(0.95_0_0)]"
    if (dias > 15) return "bg-[oklch(0.75_0.15_85)] text-[oklch(0.13_0.005_250)]"
    return "bg-[oklch(0.55_0.15_155)] text-[oklch(0.95_0_0)]"
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/funcoes")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="logo-metal relative w-[84px] h-[84px]">
              <Image
                src="/images/logo.png"
                alt="The Lord Barber"
                fill
                className="object-contain"
              />
              <div className="metal-overlay" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold tracking-wide text-foreground uppercase">
              Timer-Out
            </h1>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-2xl mx-auto w-full px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Clock className="h-12 w-12 opacity-40" />
            <p className="text-sm">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((entry, i) => (
              <div
                key={`${entry.nome}-${entry.numero}-${i}`}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
              >
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center ${getBadgeColor(entry.dias_timer_out)}`}
                >
                  <span className="text-xl font-bold leading-none">
                    {entry.dias_timer_out}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider mt-0.5 opacity-80">
                    dias
                  </span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {entry.nome}
                    </span>
                  </div>
                  {entry.numero && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {entry.numero}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
