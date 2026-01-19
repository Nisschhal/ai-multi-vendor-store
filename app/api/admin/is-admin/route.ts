// Approve Seller

import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { authAdmin } from "@/middleware/authAdmin"

export async function GET(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)

    // 2. Check if admin
    const isAdmin = await authAdmin(userId!)

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized! Admins only" },
        { status: 401 },
      )
    }

    return NextResponse.json({ isAdmin }, { status: 200 })
  } catch (error) {
    console.log("[IS_ADMIN]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
