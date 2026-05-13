"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { Automation } from "@/lib/types"

interface DeleteDialogProps {
  automation: Automation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (automation: Automation) => Promise<void>
}

export function DeleteDialog({
  automation,
  open,
  onOpenChange,
  onConfirm
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!automation) return

    setIsDeleting(true)
    try {
      await onConfirm(automation)
      onOpenChange(false)
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Automação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a automação{" "}
            <span className="font-semibold text-foreground">
              {automation?.name}
            </span>
            ? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
