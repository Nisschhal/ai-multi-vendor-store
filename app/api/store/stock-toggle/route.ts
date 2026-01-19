// toogle Stock Availability

import { prisma } from "@/lib/prisma"
import { userStoreID } from "@/middleware/userStoreID"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  try {
    // 1. get the Authenticated userID

    const { userId } = getAuth(request)

    // 2. Check for the Product ID
    const { productId } = await request.json()

    if (!productId) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
      })
    }

    // 3. Get the store ID using the userID
    const storeId = await userStoreID(userId!)

    // 3. Check if storeId exists
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized to update stock for this store" },
        { status: 401 },
      )
    }
    // 4. Check if the product belongs to the store
    const product = await prisma.product.findUnique({
      where: { id: productId, storeId: storeId },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found in this store" },
        { status: 404 },
      )
    }

    // 5. Toggle the stock availability
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { inStock: !product.inStock },
    })

    return NextResponse.json(
      { message: "Stock status updated", product: updatedProduct },
      { status: 200 },
    )
  } catch (error) {
    console.log("[STOCK_TOGGLE]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
