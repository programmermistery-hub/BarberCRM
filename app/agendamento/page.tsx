"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  CalendarDays,
  User,
  Scissors,
} from "lucide-react"
import AppointmentModal from "@/components/appointment-modal"

interface Agendamento {
  id: number
  data: string
  horario: string
  nome: string
  numero: string
  servico: string
}

const TIME_SLOTS = generateTimeSlots()

function generateTimeSlots() {
  const slots: string[] = []
  let hour = 9
  let minute = 30
  while (hour < 19 || (hour === 19 && minute === 0)) {
    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    )
    minute += 30
    if (minute >= 60) {
      hour++
      minute = 0
    }
  }
  return slots
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const WEEKDAYS = [
  "Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sabado",
]

function formatDateHeader(dateStr: string) {
  if (!dateStr) return { dayOfWeek: "", day: "", month: "", year: "" }
  const [year, month, day] = dateStr.split("-")
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return {
    dayOfWeek: WEEKDAYS[d.getDay()],
    day: day,
    month: MONTHS[parseInt(month) - 1],
    year: year,
  }
}

function getLocalDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

export default function AgendamentoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState("")
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] =
    useState<Agendamento | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [pickerDay, setPickerDay] = useState("")
  const [pickerMonth, setPickerMonth] = useState("")
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentDate(getLocalDateString(new Date()))
    setMounted(true)
  }, [])

  const fetchAgendamentos = useCallback(async (date: string) => {
    if (!date) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/agendamentos?data=${date}`)
      const data = await res.json()
      setAgendamentos(Array.isArray(data) ? data : [])
    } catch {
      setAgendamentos([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentDate) {
      fetchAgendamentos(currentDate)
    }
  }, [currentDate, fetchAgendamentos])

  // Auto-refresh every 15s
  useEffect(() => {
    if (!currentDate) return
    const interval = setInterval(() => fetchAgendamentos(currentDate), 15000)
    return () => clearInterval(interval)
  }, [currentDate, fetchAgendamentos])

  const appointmentMap = useMemo(() => {
    const map = new Map<string, Agendamento>()
    for (const a of agendamentos) {
      const time = a.horario.substring(0, 5)
      map.set(time, a)
    }
    return map
  }, [agendamentos])

  const { dayOfWeek, day, month, year } = formatDateHeader(currentDate)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false)
      }
    }
    if (datePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [datePickerOpen])

  function openDatePicker() {
    const [, m, d] = currentDate.split("-")
    setPickerDay(String(parseInt(d)))
    setPickerMonth(String(parseInt(m)))
    setDatePickerOpen(true)
  }

  function confirmDatePicker() {
    const dayNum = parseInt(pickerDay)
    const monthNum = parseInt(pickerMonth)
    const yearNum = parseInt(year)

    if (!dayNum || !monthNum || dayNum < 1 || monthNum < 1 || monthNum > 12) {
      return
    }

    const maxDays = getDaysInMonth(monthNum, yearNum)
    const clampedDay = Math.min(dayNum, maxDays)

    const newDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`
    setCurrentDate(newDate)
    setDatePickerOpen(false)
  }

  function handleSlotClick(time: string) {
    const existing = appointmentMap.get(time)
    setSelectedSlot(time)
    setSelectedAppointment(existing || null)
    setModalOpen(true)
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    )
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
              Agendamento
            </h1>
          </div>
        </div>
      </header>

      {/* Date Card - Clickable */}
      <div className="max-w-2xl mx-auto w-full px-4 py-4 relative">
        <button
          onClick={openDatePicker}
          className="w-full bg-card border border-border rounded-lg px-5 py-4 flex items-center gap-3 hover:border-primary/50 transition-all group"
        >
          <CalendarDays className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="text-left flex-1">
            <p className="text-base font-semibold text-foreground">
              {day} {month} {year}
            </p>
            <p className="text-xs text-muted-foreground">{dayOfWeek}</p>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Alterar
          </span>
        </button>

        {/* Date Picker Popup */}
        {datePickerOpen && (
          <div
            ref={datePickerRef}
            className="absolute left-4 right-4 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Selecionar Data</p>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dia
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={pickerDay}
                  onChange={(e) => setPickerDay(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmDatePicker() }}
                  className="h-12 px-4 bg-secondary border border-border rounded-lg text-foreground text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mes
                </label>
                <select
                  value={pickerMonth}
                  onChange={(e) => setPickerMonth(e.target.value)}
                  className="h-12 px-4 bg-secondary border border-border rounded-lg text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setDatePickerOpen(false)}
                className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDatePicker}
                className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[oklch(0.55_0.15_155)]" />
            <span>Livre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[oklch(0.55_0.2_25)]" />
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>Selecionado</span>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {TIME_SLOTS.map((time) => {
              const appointment = appointmentMap.get(time)
              const isOccupied = !!appointment
              const isSelected = selectedSlot === time && modalOpen

              return (
                <button
                  key={time}
                  onClick={() => handleSlotClick(time)}
                  className={`w-full rounded-lg border px-4 py-3 flex items-center gap-4 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : isOccupied
                        ? "border-[oklch(0.55_0.2_25/0.4)] bg-[oklch(0.55_0.2_25/0.08)] hover:bg-[oklch(0.55_0.2_25/0.15)]"
                        : "border-[oklch(0.55_0.15_155/0.4)] bg-[oklch(0.55_0.15_155/0.05)] hover:bg-[oklch(0.55_0.15_155/0.12)]"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-14 text-sm font-mono font-bold ${
                      isSelected
                        ? "text-primary"
                        : isOccupied
                          ? "text-[oklch(0.65_0.2_25)]"
                          : "text-[oklch(0.65_0.15_155)]"
                    }`}
                  >
                    {time}
                  </div>

                  <div
                    className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                      isSelected
                        ? "bg-primary"
                        : isOccupied
                          ? "bg-[oklch(0.55_0.2_25)]"
                          : "bg-[oklch(0.55_0.15_155)]"
                    }`}
                  />

                  {isOccupied ? (
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {appointment.nome}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Scissors className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">
                          {appointment.servico}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground/50 italic">
                      Horario livre
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedSlot(null)
        }}
        onSaved={() => fetchAgendamentos(currentDate)}
        appointment={selectedAppointment}
        selectedDate={currentDate}
        selectedTime={selectedSlot || ""}
      />
    </main>
  )
}
