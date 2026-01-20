import { prisma } from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Create user address from the request body address
export async function POST(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    // 2. Get the address data
    const { address } = await request.json()

    // 3. Update the user's address
    const newAddress = await prisma.address.create({
      data: { ...address, userId },
    })

    // 4. Return the updated address
    return NextResponse.json(
      { newAddress, message: "Address created successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[ADDRESS_POST]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

// get user address
export async function GET(request: NextRequest) {
  try {
    // 1. get the Authenticated userID
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // 2. Get the address data
    const address = await prisma.address.findMany({
      where: { userId },
    })

    // 3. Return the retrieved address
    return NextResponse.json(
      { address, message: "Address retrieved successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[ADDRESS_GET]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
