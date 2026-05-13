"use client"

import { useCallback, useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Save, Maximize2, Minimize2 } from "lucide-react"
import type { FlowchartData, FlowchartNode, FlowchartEdge } from "@/lib/types"

interface FlowchartEditorProps {
  initialData?: FlowchartData | null
  onSave: (data: FlowchartData) => void
  readOnly?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export interface FlowchartEditorHandle {
  handleSave: () => void
}

const nodeTypeConfig = {
  simple: {
    label: "Etapa",
    className: "rounded-lg",
    bg: "bg-card",
  },
  start: {
    label: "Início",
    className: "rounded-full",
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  decision: {
    label: "Decisão",
    className: "rounded-lg",
    bg: "bg-amber-100 dark:bg-amber-900/50",
    customStyle: { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
    defaultLabel: "Sim/Não?",
  },
  end: {
    label: "Fim",
    className: "rounded-full",
    bg: "bg-slate-100 dark:bg-slate-800",
  },
}

function StepNode({ data, selected }: NodeProps) {
  const config = nodeTypeConfig[data.type as keyof typeof nodeTypeConfig] || nodeTypeConfig.simple

  return (
    <div
      className={`
        relative overflow-visible px-4 py-3 border-2 shadow-sm min-w-[140px] min-h-[80px] text-center flex items-center justify-center
        ${config.bg} ${config.className}
        ${selected ? "border-primary ring-2 ring-primary/20" : "border-border dark:border-border/50"}
        ${data.type === "decision" ? "border-amber-500 dark:border-amber-600" : ""}
        transition-all duration-150
      `}
      style={(config as any).customStyle}
    >
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
        style={{
          background: "#3b82f6",
          width: 12,
          height: 12,
          border: "2px solid white",
          zIndex: 1000,
        }}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
        style={{
          background: "#3b82f6",
          width: 12,
          height: 12,
          border: "2px solid white",
          zIndex: 1000,
        }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
        style={{
          background: "#3b82f6",
          width: 12,
          height: 12,
          border: "2px solid white",
          zIndex: 1000,
        }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
        style={{
          background: "#3b82f6",
          width: 12,
          height: 12,
          border: "2px solid white",
          zIndex: 1000,
        }}
      />
      <span className="text-sm font-medium select-none flex items-center justify-center gap-1 text-foreground">
        {data.type === "decision" && <span className="text-lg">?</span>}
        {data.label as string}
      </span>
    </div>
  )
}

const nodeTypes = {
  simple: StepNode,
  start: StepNode,
  decision: StepNode,
  question: StepNode,
  end: StepNode,
}

function mapFlowchartNodeToReactFlow(node: FlowchartNode): Node {
  return {
    ...node,
    type: node.data.shape || "simple",
    data: {
      label: node.data.label,
      type: node.data.shape || "simple",
    },
  }
}

function mapReactFlowNodeToFlowchart(node: Node): FlowchartNode {
  return {
    id: node.id,
    type: String(node.type || "simple"),
    position: node.position as { x: number; y: number },
    data: {
      label: String((node.data as any)?.label ?? ""),
      shape: String((node.data as any)?.type ?? "simple"),
    },
  }
}

function mapFlowchartEdgeToReactFlow(edge: FlowchartEdge): Edge {
  return {
    ...edge,
    sourceHandle: edge.sourceHandle || null,
    targetHandle: edge.targetHandle || null,
    style: edge.style as any,
  }
}

function ensureUniqueEdgeIds(edges: FlowchartEdge[]): FlowchartEdge[] {
  const seen = new Set<string>()
  return edges.map(edge => {
    let uniqueId = edge.id
    let counter = 1
    
    // Se o ID já existe, gerar um novo único
    while (seen.has(uniqueId)) {
      uniqueId = `${edge.id}-${counter++}`
    }
    
    seen.add(uniqueId)
    return { ...edge, id: uniqueId }
  })
}

function mapReactFlowEdgeToFlowchart(edge: Edge): FlowchartEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || null,
    targetHandle: edge.targetHandle || null,
    animated: edge.animated,
    style: edge.style as Record<string, string> | undefined,
  }
}

export const FlowchartEditor = forwardRef<FlowchartEditorHandle, FlowchartEditorProps>(
  ({ initialData, onSave, readOnly = false, isFullscreen = false, onToggleFullscreen }, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.nodes?.map(mapFlowchartNodeToReactFlow) || []
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialData?.edges?.map(mapFlowchartEdgeToReactFlow) || []
  )
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState("")
  const nodeCounter = useRef(1)
  const edgeCounter = useRef(1)

  // Expor handleSave para o componente pai
  useImperativeHandle(ref, () => ({
    handleSave: () => {
      onSave({
        nodes: nodes.map(mapReactFlowNodeToFlowchart),
        edges: edges.map(mapReactFlowEdgeToFlowchart),
      })
    },
  }), [nodes, edges, onSave])

  // Sincroniza com dados iniciais
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes?.map(mapFlowchartNodeToReactFlow) || [])
      const uniqueEdges = ensureUniqueEdgeIds(initialData.edges || [])
      setEdges(uniqueEdges.map(mapFlowchartEdgeToReactFlow))
      
      // Atualizar contadores baseado nos dados existentes
      if (initialData.nodes && initialData.nodes.length > 0) {
        const maxNodeId = Math.max(...initialData.nodes.map(n => {
          const match = n.id.match(/node-(\d+)/)
          return match ? parseInt(match[1]) : 0
        }))
        nodeCounter.current = maxNodeId + 1
      }
      
      if (uniqueEdges.length > 0) {
        const maxEdgeId = Math.max(...uniqueEdges.map(e => {
          const match = e.id.match(/e(\d+)/)
          return match ? parseInt(match[1]) : 0
        }))
        edgeCounter.current = maxEdgeId + 1
      }
    }
  }, [initialData, setNodes, setEdges])

  // Handler de conexao
  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return
      const edge: Edge = {
        ...connection,
        id: `e${edgeCounter.current++}`,
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      } as Edge
      setEdges((eds) => addEdge(edge, eds))
    },
    [setEdges, readOnly]
  )

  // Adicionar novo no, suportando tipos diferentes
  const addNode = useCallback(
    (type: keyof typeof nodeTypeConfig = "simple") => {
      if (readOnly) return
      const nextIndex = nodeCounter.current++
      const config = nodeTypeConfig[type]
      const label = (config as any).defaultLabel || `${config.label} ${nextIndex}`

      const newNode: Node = {
        id: `node-${nextIndex}`,
        type,
        position: {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 150,
        },
        data: { label, type },
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes, readOnly]
  )

  // Excluir no selecionado
  const deleteSelected = useCallback(() => {
    if (readOnly || !selectedNode) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode))
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode))
    setSelectedNode(null)
    setEditingLabel("")
  }, [selectedNode, setNodes, setEdges, readOnly])

  // Ao clicar em um no
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
    setEditingLabel(node.data.label as string)
  }, [])

  // Atualizar label do no
  const updateNodeLabel = useCallback(() => {
    if (readOnly || !selectedNode || !editingLabel.trim()) return
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode ? { ...n, data: { ...n.data, label: editingLabel } } : n
      )
    )
  }, [selectedNode, editingLabel, setNodes, readOnly])

  // Salvar fluxograma
  const handleSave = useCallback(() => {
    onSave({
      nodes: nodes.map(mapReactFlowNodeToFlowchart),
      edges: edges.map(mapReactFlowEdgeToFlowchart),
    })
    toast.success("Fluxograma salvo com sucesso!")
  }, [nodes, edges, onSave])

  // Clicar no canvas (deselecionar)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setEditingLabel("")
  }, [])

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        connectOnClick={false}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: "#3b82f6", strokeWidth: 2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-muted/30" />
        <Controls showInteractive={false} className="!bg-background !border-border !shadow-lg [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" />

        {!readOnly && (
          <Panel position="top-left" className="bg-background border shadow-lg rounded-xl p-1.5 flex items-center gap-1">
            {Object.entries(nodeTypeConfig).map(([type, config]) => (
              <Button
                key={type}
                size="sm"
                variant="ghost"
                onClick={() => addNode(type as keyof typeof nodeTypeConfig)}
                className="h-9 px-3 text-sm font-medium hover:bg-muted"
              >
                <Plus className="h-4 w-4 mr-1.5 text-muted-foreground" />
                {config.label}
              </Button>
            ))}
          </Panel>
        )}

        <Panel position="top-right" className="bg-background border shadow-lg rounded-xl p-1.5 flex items-center gap-1">
          {onToggleFullscreen && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onToggleFullscreen} 
              className="h-9 w-9 p-0 hover:bg-muted"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          {!readOnly && (
            <Button 
              size="sm" 
              onClick={handleSave} 
              className="h-9 px-4 text-sm font-medium"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Salvar
            </Button>
          )}
        </Panel>

        {!readOnly && selectedNode && (
          <Panel position="bottom-left" className="bg-background border shadow-lg rounded-xl p-2 flex items-center gap-2">
            <Input
              value={editingLabel}
              onChange={(e) => setEditingLabel(e.target.value)}
              onBlur={updateNodeLabel}
              onKeyDown={(e) => e.key === "Enter" && updateNodeLabel()}
              className="h-9 w-48 text-sm"
              placeholder="Nome da etapa"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={deleteSelected}
              className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
})

FlowchartEditor.displayName = "FlowchartEditor"
