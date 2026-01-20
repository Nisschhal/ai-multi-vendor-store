import { prisma } from "@/lib/prisma"
import { userStoreID } from "@/middleware/userStoreID"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Update seller order status
export async function PATCH(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)

    // 2. Get the store ID using the userID
    const storeId = await userStoreID(userId!)

    // 3. Check if storeId exists
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized to update stock for this store" },
        { status: 401 },
      )
    }
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 },
      )
    }
    // 4. Check if the product belongs to the store
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    })

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(
      { message: "Order status updated successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[UPDATE_STOCK]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// GEt all the order for a store with user, address, and product details
export async function GET(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)

    // 2. Get the store ID using the userID
    const storeId = await userStoreID(userId!)

    // 3. Check if storeId exists
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized to access this store" },
        { status: 401 },
      )
    }

    // 4.Get the order of the store
    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        user: true,
        address: true,
        orderItems: { include: { product: true } },
      },
    })

    // 4. Return the created product
    return NextResponse.json(
      { orders, message: "Orders retrieved successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.log("[PRODUCT_POST]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
