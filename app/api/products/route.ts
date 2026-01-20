import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Get all the products
export async function GET(request: NextRequest) {
  try {
    let products = await prisma.product.findMany({
      where: { inStock: true },
      include: {
        rating: {
          select: {
            createdAt: true,
            rating: true,
            review: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        store: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // If store is inactive, remove it
    products = products.filter((product) => {
      product.store.isActive
    })
    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.log("[PRODUCT_GET]", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
