export type AutomationStatus = "ACTIVE" | "PAUSED" | "DISABLED" | "DELETED"

export interface FlowchartNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: { label: string; shape: string }
}

export interface FlowchartEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  animated?: boolean
  style?: Record<string, string>
}

export interface FlowchartData {
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
}

export interface Automation {
  id: string
  name: string
  description: string | null
  status: AutomationStatus
  documentation: string | null
  link: string | null
  tags: string[]
  flowchart: FlowchartData | null
  createdAt: Date
  updatedAt: Date
}

export interface Developer {
  id: string
  email: string
  name: string
}

export const statusConfig: Record<AutomationStatus, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: "Ativa", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  PAUSED: { label: "Pausada", color: "text-amber-700", bgColor: "bg-amber-100" },
  DISABLED: { label: "Desativada", color: "text-slate-700", bgColor: "bg-slate-200" },
  DELETED: { label: "Excluída", color: "text-red-700", bgColor: "bg-red-100" }
}
