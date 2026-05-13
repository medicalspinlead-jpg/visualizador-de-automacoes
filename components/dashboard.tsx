"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Plus, Search, Filter, Loader2, Workflow } from "lucide-react"
import { Header } from "./header"
import { AutomationCard } from "./automation-card"
import { AutomationForm } from "./automation-form"
import { AutomationDetail } from "./automation-detail"
import { DeleteDialog } from "./delete-dialog"
import { LoginDialog } from "./login-dialog"
import { Automation, AutomationStatus, Developer, statusConfig, FlowchartData } from "@/lib/types"

export function Dashboard() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>([])
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | "ALL">("ALL")

  // Dialog states
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)

  const fetchAutomations = useCallback(async () => {
    try {
      const response = await fetch("/api/automations")
      const contentType = response.headers.get("content-type")
      if (response.ok && contentType?.includes("application/json")) {
        const data = await response.json()
        setAutomations(Array.isArray(data) ? data : [])
      } else {
        setAutomations([])
      }
    } catch (error) {
      console.error("Error fetching automations:", error)
      setAutomations([])
    }
  }, [])

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session")
      const contentType = response.headers.get("content-type")
      if (response.ok && contentType?.includes("application/json")) {
        const data = await response.json()
        if (data.authenticated) {
          setDeveloper(data.developer)
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([fetchAutomations(), checkSession()])
      setIsLoading(false)
    }
    init()
  }, [fetchAutomations, checkSession])

  useEffect(() => {
    let filtered = automations

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((a) => a.status === statusFilter)
    }

    setFilteredAutomations(filtered)
  }, [automations, searchQuery, statusFilter])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setDeveloper(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleCreateAutomation = async (data: Partial<Automation>) => {
    const response = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      toast.error("Erro ao criar automação")
      throw new Error("Erro ao criar automação")
    }

    await fetchAutomations()
    toast.success("Automação criada com sucesso!")
  }

  const handleUpdateAutomation = async (data: Partial<Automation>) => {
    if (!selectedAutomation) return

    const response = await fetch(`/api/automations/${selectedAutomation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      toast.error("Erro ao atualizar automação")
      throw new Error("Erro ao atualizar automação")
    }

    await fetchAutomations()
    toast.success("Automação atualizada com sucesso!")
  }

  const handleDeleteAutomation = async (automation: Automation) => {
    const response = await fetch(`/api/automations/${automation.id}`, {
      method: "DELETE"
    })

    if (!response.ok) {
      toast.error("Erro ao excluir automação")
      throw new Error("Erro ao excluir automação")
    }

    await fetchAutomations()
    toast.success("Automação excluída com sucesso!")
  }

  const handleFlowchartSave = async (automationId: string, flowchart: FlowchartData) => {
    const response = await fetch(`/api/automations/${automationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flowchart })
    })

    if (!response.ok) {
      toast.error("Erro ao salvar fluxograma")
      throw new Error("Erro ao salvar fluxograma")
    }

    await fetchAutomations()
    // Atualiza o selectedAutomation para refletir as mudanças
    const updatedAutomation = automations.find(a => a.id === automationId)
    if (updatedAutomation) {
      setSelectedAutomation({ ...updatedAutomation, flowchart })
    }
  }

  const openEditDialog = (automation: Automation) => {
    setSelectedAutomation(automation)
    setShowFormDialog(true)
  }

  const openDeleteDialog = (automation: Automation) => {
    setSelectedAutomation(automation)
    setShowDeleteDialog(true)
  }

  const openDetailDialog = (automation: Automation) => {
    setSelectedAutomation(automation)
    setShowDetailDialog(true)
  }

  const openCreateDialog = () => {
    setSelectedAutomation(null)
    setShowFormDialog(true)
  }

  const countByStatus = (status: AutomationStatus) =>
    automations.filter((a) => a.status === status).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        developer={developer}
        onLoginClick={() => setShowLoginDialog(true)}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div
              key={status}
              className="bg-card border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {countByStatus(status as AutomationStatus)}
                </p>
                <p className={`text-sm ${config.color}`}>{config.label}</p>
              </div>
              <div className={`p-3 rounded-full ${config.bgColor}`}>
                <Workflow className={`h-5 w-5 ${config.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar automações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as AutomationStatus | "ALL")}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {developer && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Automação
              </Button>
            )}
          </div>
        </div>

        {/* Automations Grid */}
        {filteredAutomations.length === 0 ? (
          <div className="text-center py-12">
            <Workflow className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {automations.length === 0
                ? "Nenhuma automação cadastrada"
                : "Nenhuma automação encontrada"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {automations.length === 0
                ? "Comece adicionando sua primeira automação."
                : "Tente ajustar os filtros de busca."}
            </p>
            {developer && automations.length === 0 && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Automação
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAutomations.map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                isAuthenticated={!!developer}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onView={openDetailDialog}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onSuccess={() => checkSession()}
      />

      <AutomationForm
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        automation={selectedAutomation}
        onSubmit={selectedAutomation ? handleUpdateAutomation : handleCreateAutomation}
      />

      <AutomationDetail
        automation={selectedAutomation}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        onFlowchartSave={developer ? handleFlowchartSave : undefined}
      />

      <DeleteDialog
        automation={selectedAutomation}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAutomation}
      />
    </div>
  )
}
