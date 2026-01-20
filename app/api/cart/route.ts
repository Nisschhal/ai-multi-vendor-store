import { prisma } from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Update/Create user cart
export async function PUT(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // 2. Get the cart data
    const { cart } = await request.json()

    // 3. Update the user's cart
    const updatedCart = await prisma.user.update({
      where: { id: userId },
      data: { cart },
    })

    // 4. Return the updated cart
    return NextResponse.json(
      { updatedCart, message: "Cart updated successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[CART_PUT]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

// Get user cart
export async function GET(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // 2. Get the cart data
    const cart = await prisma.user.findUnique({
      where: { id: userId },
      select: { cart: true },
    })

    // 3. Return the updated cart
    return NextResponse.json(
      { cart, message: "Cart retrieved successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[CART_GET]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
