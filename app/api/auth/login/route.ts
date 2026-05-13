import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const developer = await prisma.developer.findUnique({
      where: { email }
    })

    if (!developer) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, developer.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    await createSession(developer.id)

    return NextResponse.json({
      id: developer.id,
      email: developer.email,
      name: developer.name
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
