// Approve Seller
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { authAdmin } from "@/middleware/authAdmin"
import { prisma } from "@/lib/prisma"

// Get all pending or rejected stores
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

    // 3. Fetch all pending or rejected stores
    const stores = await prisma.store.findMany({
      where: { status: "approved" },
      include: {
        user: true,
      },
    })

    if (stores.length === 0) {
      return NextResponse.json(
        { message: "No approved stores found" },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { stores, message: "Stores fetched successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[GET_STORE]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
