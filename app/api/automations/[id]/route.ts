import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const automation = await prisma.automation.findUnique({
      where: { id }
    })

    if (!automation) {
      return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(automation)
  } catch (error) {
    console.error("Error fetching automation:", error)
    return NextResponse.json({ error: "Erro ao buscar automação" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, status, documentation, pdfUrl, pdfName, link, tags, flowchart } = body

    const automation = await prisma.automation.update({
      where: { id },
      data: {
        name,
        description,
        status,
        documentation,
        pdfUrl,
        pdfName,
        link,
        tags,
        flowchart
      }
    })

    return NextResponse.json(automation)
  } catch (error) {
    console.error("Error updating automation:", error)
    return NextResponse.json({ error: "Erro ao atualizar automação" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    await prisma.automation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting automation:", error)
    return NextResponse.json({ error: "Erro ao excluir automação" }, { status: 500 })
  }
}
