"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Save, Trash2, User, Phone, Scissors } from "lucide-react"
import { toast } from "sonner"

interface Appointment {
  id?: number
  data: string
  horario: string
  nome: string
  numero: string
  servico: string
}

interface Cliente {
  id: number
  nome_completo: string
  numero: string
}

interface AppointmentModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  appointment: Appointment | null
  selectedDate: string
  selectedTime: string
}

export default function AppointmentModal({
  open,
  onClose,
  onSaved,
  appointment,
  selectedDate,
  selectedTime,
}: AppointmentModalProps) {
  const [nome, setNome] = useState("")
  const [numero, setNumero] = useState("")
  const [servico, setServico] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Client autocomplete state
  const [suggestions, setSuggestions] = useState<Cliente[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null)
  const [numeroLocked, setNumeroLocked] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isEditing = !!appointment?.id

  useEffect(() => {
    if (appointment) {
      setNome(appointment.nome)
      setNumero(appointment.numero || "")
      setServico(appointment.servico)
      setSelectedClienteId(null)
      setNumeroLocked(true)
    } else {
      setNome("")
      setNumero("")
      setServico("")
      setSelectedClienteId(null)
      setNumeroLocked(false)
    }
    setSuggestions([])
    setShowSuggestions(false)
  }, [appointment, open])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const searchClientes = useCallback((query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clientes?nome=${encodeURIComponent(query.trim())}`)
        const data: Cliente[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 300)
  }, [])

  function handleNomeChange(value: string) {
    setNome(value)
    // If user changes name after selecting a client, reset
    if (selectedClienteId) {
      setSelectedClienteId(null)
      setNumero("")
      setNumeroLocked(false)
    }
    searchClientes(value)
  }

  function selectCliente(cliente: Cliente) {
    setNome(cliente.nome_completo)
    setNumero(cliente.numero)
    setSelectedClienteId(cliente.id)
    setNumeroLocked(true)
    setShowSuggestions(false)
    setSuggestions([])
  }

  function normalizeNumero(value: string) {
    return value.replace(/[^\d]/g, "")
  }

  async function handleSave() {
    if (!nome.trim() || !servico.trim()) {
      toast.error("Nome e servico sao obrigatorios")
      return
    }

    // If new client (no selectedClienteId and not editing), numero is required
    if (!selectedClienteId && !isEditing && !numero.trim()) {
      toast.error("Numero e obrigatorio para novo cliente")
      return
    }

    setSaving(true)
    try {
      if (isEditing) {
        const res = await fetch(`/api/agendamentos/${appointment!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim().toUpperCase(),
            numero: normalizeNumero(numero),
            servico: servico.trim(),
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || "Erro ao atualizar")
          return
        }
        toast.success("Agendamento atualizado")
      } else {
        const res = await fetch("/api/agendamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: selectedDate,
            horario: selectedTime,
            nome: nome.trim().toUpperCase(),
            numero: normalizeNumero(numero),
            servico: servico.trim(),
            cliente_id: selectedClienteId || undefined,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || "Erro ao criar agendamento")
          return
        }
        toast.success("Agendamento criado")
      }
      onSaved()
      onClose()
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!appointment?.id) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/agendamentos/${appointment.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        toast.error("Erro ao excluir agendamento")
        return
      }
      toast.success("Agendamento excluido")
      onSaved()
      onClose()
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setDeleting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[oklch(0_0_0/0.7)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedTime} - {formatDateDisplay(selectedDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 flex flex-col gap-3.5">
          {/* Nome with autocomplete */}
          <div className="relative" ref={suggestionsRef}>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <input
              type="text"
              placeholder="Nome Completo *"
              value={nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
              autoFocus
            />
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto">
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCliente(c)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-secondary/80 transition-colors border-b border-border last:border-b-0"
                  >
                    <span className="text-sm text-foreground font-medium">
                      {c.nome_completo}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {c.numero}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Numero */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={selectedClienteId ? "Auto preenchido" : "Numero *"}
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              readOnly={numeroLocked}
              className={`w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm ${
                numeroLocked ? "opacity-70 cursor-not-allowed" : ""
              }`}
            />
            {numeroLocked && !isEditing && (
              <button
                onClick={() => {
                  setNumeroLocked(false)
                  setSelectedClienteId(null)
                  setNumero("")
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {/* Servico */}
          <div className="relative">
            <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Servico *"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
            />
          </div>

          {/* Client status indicator */}
          {selectedClienteId && (
            <p className="text-xs text-[oklch(0.65_0.15_155)]">
              Cliente existente selecionado
            </p>
          )}
          {!selectedClienteId && nome.trim().length > 2 && !isEditing && (
            <p className="text-xs text-primary">
              Novo cliente - numero obrigatorio
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-border flex items-center gap-3">
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="h-10 px-4 rounded-lg border border-[oklch(0.55_0.2_25)] text-[oklch(0.55_0.2_25)] text-sm font-medium hover:bg-[oklch(0.55_0.2_25/0.1)] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? (
                <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Excluir
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deleting}
            className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDateDisplay(dateStr: string) {
  const [year, month, day] = dateStr.split("-")
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ]
  return `${day} ${months[parseInt(month) - 1]} ${year}`
}
