import { put, del } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Apenas arquivos PDF são permitidos" }, { status: 400 })
    }

    const blob = await put(`automations/${Date.now()}-${file.name}`, file, {
      access: "public"
    })

    return NextResponse.json({ url: blob.url, name: file.name })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL não fornecida" }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Erro ao excluir arquivo" }, { status: 500 })
  }
}
