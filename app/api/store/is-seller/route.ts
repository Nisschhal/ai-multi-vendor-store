// Check if logged in user is a seller
import { NextRequest, NextResponse } from "next/server"
import { userStoreID } from "@/middleware/userStoreID"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)
    // 2. Get the store ID using the userID
    const storeId = await userStoreID(userId!)

    // 3. Check if storeId exists
    if (!storeId) {
      return NextResponse.json(
        { messate: "Unauthorized! You are not a seller" },
        { status: 401 },
      )
    }

    const storeInfo = await prisma.store.findUnique({
      where: { id: storeId },
    })

    return NextResponse.json({ isSeller: true, storeId }, { status: 200 })
  } catch (error) {
    console.log("[IS_SELLER]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
