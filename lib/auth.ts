// Authentication utilities for developer sessions
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const SESSION_COOKIE_NAME = "developer_session"

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionToken) {
    return null
  }

  try {
    const developerId = Buffer.from(sessionToken, "base64").toString("utf-8")
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { id: true, email: true, name: true }
    })
    return developer
  } catch {
    return null
  }
}

export async function createSession(developerId: string) {
  const cookieStore = await cookies()
  const sessionToken = Buffer.from(developerId).toString("base64")
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/"
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
