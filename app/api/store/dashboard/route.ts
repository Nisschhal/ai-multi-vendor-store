// Get Dashboard Metrics for Seller: Total Sales, Total Products, Total Orders
import { prisma } from "@/lib/prisma"
import { userStoreID } from "@/middleware/userStoreID"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // 1. get the Authenticated userID

    const { userId } = getAuth(request)

    // 2. Get the store ID using the userID
    const storeId = await userStoreID(userId!)

    // 3. Check if storeId exists
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized to access this store dashboard" },
        { status: 401 },
      )
    }

    // 4. Fetch dashboard metrics
    const products = await prisma.product.findMany({
      where: { storeId },
    })

    const orders = await prisma.order.findMany({
      where: { storeId },
    })

    const ratings = await prisma.rating.findMany({
      where: { productId: { in: products.map((product) => product.id) } },
    })

    const dashboardData = {
      totalSales: orders.length,
      totalProducts: products.length,
      totalOrders: orders.length,

      ratings,
      totalEarnings: orders.reduce((acc, order) => acc + order.total, 0),
    }
    return NextResponse.json(
      { dashboardData, message: "Dashboard data retrieved successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[DASHBOARD_GET]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
