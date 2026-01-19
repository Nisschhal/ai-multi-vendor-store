// Check if admin
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function authAdmin(userId: string) {
  try {
    //  Check if admin
    const user = await prisma.user.findUnique({
      where: { id: userId! },
    })
    return (
      process.env.ADMIN_EMAILS?.split(",").includes(user?.email || "") ?? false
    )
  } catch (error) {
    console.log("[IS_ADMIN]", error)

    return false
  }
}
