import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const automations = await prisma.automation.findMany({
      orderBy: { updatedAt: "desc" }
    })
    return NextResponse.json(automations)
  } catch (error) {
    console.error("Error fetching automations:", error)
    // Return empty array if database is not available
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, status, documentation, pdfUrl, pdfName, link, tags, flowchart } = body

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const automation = await prisma.automation.create({
      data: {
        name,
        description: description || null,
        status: status || "ACTIVE",
        documentation: documentation || null,
        pdfUrl: pdfUrl || null,
        pdfName: pdfName || null,
        link: link || null,
        tags: tags || [],
        flowchart: flowchart || null
      }
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    console.error("Error creating automation:", error)
    return NextResponse.json({ error: "Erro ao criar automação" }, { status: 500 })
  }
}
