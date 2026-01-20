// Add new coupon

import { inngest } from "@/ingest/client"
import { prisma } from "@/lib/prisma"
import { authAdmin } from "@/middleware/authAdmin"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    const isAdmin = await authAdmin(userId!)

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized! Admins only" },
        { status: 401 },
      )
    }

    // newCoupon as coupon data
    const { newCoupon: coupon } = await request.json()
    console.log("Received coupon data:", coupon)
    if (!coupon) {
      return NextResponse.json(
        { error: "Missing coupon data" },
        { status: 400 },
      )
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: coupon.code },
    })

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Coupon code already exists" },
        { status: 400 },
      )
    }

    const newCoupon = await prisma.coupon
      .create({
        data: coupon,
      })
      .then(async (coupon) => {
        await inngest.send({
          name: "app/coupon.expired",
          data: {
            couponId: coupon.code,
            expiresAt: coupon.expiresAt,
          },
        })
      })

    return NextResponse.json(
      { coupon: newCoupon, message: "Coupon created successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.log("[ADD_COUPON]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}

// Delete coupon /api/coupon?id=couponId
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    const isAdmin = await authAdmin(userId!)

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized! Admins only" },
        { status: 401 },
      )
    }

    const couponId = request.nextUrl.searchParams.get("id")

    if (!couponId) {
      return NextResponse.json({ error: "Missing coupon ID" }, { status: 400 })
    }

    await prisma.coupon
      .delete({
        where: { code: couponId },
      })
      .then(async (coupon) => {
        await inngest.send({
          name: "app/coupon.deleted",
          data: {
            code: coupon.code,
          },
        })
      })

    return NextResponse.json(
      { message: "Coupon deleted successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[DELETE_COUPON]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}

// Get all coupons
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    const isAdmin = await authAdmin(userId!)

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized! Admins only" },
        { status: 401 },
      )
    }

    const coupons = await prisma.coupon.findMany()

    return NextResponse.json(
      { coupons, message: "Coupons fetched successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.log("[GET_COUPONS]", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
