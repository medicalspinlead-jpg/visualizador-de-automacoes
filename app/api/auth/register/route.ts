import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const existingDeveloper = await prisma.developer.findUnique({
      where: { email }
    })

    if (existingDeveloper) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const developer = await prisma.developer.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    await createSession(developer.id)

    return NextResponse.json({
      id: developer.id,
      email: developer.email,
      name: developer.name
    }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
