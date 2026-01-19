// GEt Dashboard data for admin (total orders, stores, total products, total revenue)

import { prisma } from "@/lib/prisma"
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

    // 3. Fetch dashboard data
    // total orders, total stores, total products, total revenue
    const stores = await prisma.store.count()
    const orders = await prisma.product.count()
    // GEt total orders of which only createAt and total
    const allOrders = await prisma.order.findMany({
      select: {
        createdAt: true,
        total: true,
      },
    })
    const revenue = allOrders
      .reduce((acc, order) => acc + order.total, 0)
      .toFixed(2)

    // total product on app
    const products = await prisma.product.count()

    const dashboardData = {
      stores,
      products,
      orders,
      revenue,
      allOrders,
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
