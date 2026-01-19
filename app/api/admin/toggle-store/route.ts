// Approve Seller
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { authAdmin } from "@/middleware/authAdmin"
import { prisma } from "@/lib/prisma"

// Get all pending or rejected stores
export async function PATCH(request: NextRequest) {
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

    // 3. Get the store ID
    const { storeId } = await request.json()

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 },
      )
    }
    // Get the store details and toggle isActive
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { isActive: !store.isActive },
    })

    return NextResponse.json(
      { store: updatedStore, message: "Store status toggled successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[TOGGLE_STORE]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
