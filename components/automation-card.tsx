"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Pencil, Trash2, ExternalLink, Link as LinkIcon, Tag } from "lucide-react"
import { Automation, statusConfig } from "@/lib/types"

interface AutomationCardProps {
  automation: Automation
  isAuthenticated: boolean
  onEdit?: (automation: Automation) => void
  onDelete?: (automation: Automation) => void
  onView: (automation: Automation) => void
}

export function AutomationCard({
  automation,
  isAuthenticated,
  onEdit,
  onDelete,
  onView
}: AutomationCardProps) {
  const status = statusConfig[automation.status]

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
            {automation.name}
          </CardTitle>
          <Badge className={`${status.bgColor} ${status.color} border-0 shrink-0`}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {automation.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {automation.description}
          </p>
        )}

        {automation.tags && automation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {automation.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
            {automation.tags.length > 4 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{automation.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {automation.link && (
          <a
            href={automation.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <LinkIcon className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{automation.link}</span>
          </a>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {automation.pdfName && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{automation.pdfName}</span>
            </div>
          )}
          {automation.documentation && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Documentação</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Atualizado em {new Date(automation.updatedAt).toLocaleDateString("pt-BR")}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(automation)}
              className="h-8 px-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Ver detalhes</span>
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(automation)}
                  className="h-8 px-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(automation)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
