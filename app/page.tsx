"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, User, LogIn } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login")
        return
      }

      router.push("/funcoes")
    } catch {
      toast.error("Erro de conexao com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="logo-metal relative w-[420px] h-[420px]">
            <Image
              src="/images/logo.png"
              alt="The Lord Barber"
              fill
              className="object-contain"
              priority
            />
            <div className="metal-overlay" aria-hidden="true" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wide text-foreground">
              THE LORD BARBER
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema de Gerenciamento
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
        >
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              required
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Entrar
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-muted-foreground/60">
          Acesso restrito a funcionarios autorizados
        </p>
      </div>
    </main>
  )
}
