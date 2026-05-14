"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ExternalLink, Calendar, Clock, Link as LinkIcon, Tag, GitBranch } from "lucide-react"
import { Automation, statusConfig, FlowchartData } from "@/lib/types"
import { FlowchartEditor } from "@/components/flowchart-editor"

interface AutomationDetailProps {
  automation: Automation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onFlowchartSave?: (automationId: string, flowchart: FlowchartData) => void
}

export function AutomationDetail({
  automation,
  open,
  onOpenChange,
  onFlowchartSave
}: AutomationDetailProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [isFlowchartFullscreen, setIsFlowchartFullscreen] = useState(false)
  
  if (!automation) return null

  const status = statusConfig[automation.status]

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[calc(100vw-2rem)] !max-w-none h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <DialogTitle className="text-lg sm:text-xl font-bold pr-0 sm:pr-8">
              {automation.name}
            </DialogTitle>
            <Badge className={`${status.bgColor} ${status.color} border-0 shrink-0 w-fit`}>
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 sm:mx-6 mb-2 w-fit">
            <TabsTrigger value="info" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Informacoes</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="flowchart" className="gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Fluxograma</span>
              <span className="sm:hidden">Fluxo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
            <ScrollArea className="h-full px-4 sm:px-6">
              <div className="space-y-4 sm:space-y-6 pr-2 sm:pr-4 overflow-hidden pb-4">
                {automation.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Descricao
                    </h3>
                    <p className="text-foreground">{automation.description}</p>
                  </div>
                )}

                {automation.tags && automation.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {automation.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {automation.link && (
                  <div className="space-y-2 overflow-hidden">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 shrink-0" />
                      Link da Automacao
                    </h3>
                    <a
                      href={automation.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline bg-muted/50 px-3 py-2 rounded-lg w-full"
                    >
                      <span className="break-all text-xs sm:text-sm flex-1 min-w-0">{automation.link}</span>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      Criado em {new Date(automation.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      Atualizado em {new Date(automation.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {automation.documentation && (
                  <>
                    <Separator />
                    <div className="space-y-3 overflow-hidden">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Documentacao
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 overflow-x-auto prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-h1:text-lg sm:prose-h1:text-xl prose-h2:text-base sm:prose-h2:text-lg prose-h3:text-sm sm:prose-h3:text-base prose-p:text-foreground prose-p:leading-relaxed prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:overflow-x-auto prose-p:text-sm sm:prose-p:text-base">
                        <ReactMarkdown>{automation.documentation}</ReactMarkdown>
                      </div>
                    </div>
                  </>
                )}

                {!automation.documentation && (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm sm:text-base">Nenhuma documentacao disponivel</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent 
            value="flowchart" 
            className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden px-4 sm:px-6 pb-4"
          >
            <div className="h-full">
              <FlowchartEditor
                initialData={automation.flowchart}
                onSave={(flowchart) => onFlowchartSave?.(automation.id, flowchart)}
                readOnly={!onFlowchartSave}
                isFullscreen={isFlowchartFullscreen}
                onToggleFullscreen={() => setIsFlowchartFullscreen(!isFlowchartFullscreen)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end px-4 sm:px-6 py-4 border-t mt-auto bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {isFlowchartFullscreen && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-[100] bg-background">
        <FlowchartEditor
          initialData={automation.flowchart}
          onSave={(flowchart) => onFlowchartSave?.(automation.id, flowchart)}
          readOnly={!onFlowchartSave}
          isFullscreen={isFlowchartFullscreen}
          onToggleFullscreen={() => setIsFlowchartFullscreen(false)}
        />
      </div>,
      document.body
    )}
    </>
  )
}
