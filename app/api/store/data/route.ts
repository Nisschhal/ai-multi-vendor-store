import { prisma } from "@/lib/prisma"
import { userStoreID } from "@/middleware/userStoreID"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// GEt Store infor and products
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

    // 4.Get the form data: name, description, price, images
    const storeInfo = await prisma.store.findUnique({
      where: { id: storeId },
      include: { Product: { include: { rating: true } } },
    })

    // 4. Return the created product
    return NextResponse.json(
      { storeInfo, message: "Store info retrieved successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.log("[STORE_GET]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
