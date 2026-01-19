// Approve Seller
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { authAdmin } from "@/middleware/authAdmin"
import { prisma } from "@/lib/prisma"

// Approve or Reject a store
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

    // 3. Parse the request body to get storeId and approve/reject action
    const { storeId, status } = await request.json()
    console.log("STORE APPROVAL DATA:", { storeId, status })

    if (!storeId || !status) {
      return NextResponse.json(
        { error: "Missing storeId or status" },
        { status: 400 },
      )
    }
    let updatedStore = null
    // 4. Update the store status
    if (status === "approved") {
      updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: { status: "approved", isActive: true },
      })
    } else if (status === "rejected") {
      updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: { status: "rejected", isActive: false },
      })
    }

    return NextResponse.json(
      {
        store: updatedStore,
        message: "Store status updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.log("[APPROVE_STORE]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}

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
      where: { status: { in: ["pending", "rejected"] } },
      include: {
        user: true,
      },
    })

    console.log("STORES TO APPROVE:", stores)

    return NextResponse.json(
      { stores, message: "Stores fetched successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[APPROVE_STORE]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
