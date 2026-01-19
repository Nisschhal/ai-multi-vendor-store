import { uploadAndOptimizeImage } from "@/lib/imagekit/upload-image"
import { prisma } from "@/lib/prisma"
import { userStoreID } from "@/middleware/userStoreID"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Add new product
export async function POST(request: NextRequest) {
  try {
    // 1. get the Authenticated userID

    const { userId } = getAuth(request)

    // 2. Get the store ID using the userID
    const storeId = await userStoreID(userId!)

    // 3. Check if storeId exists
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized to add products to this store" },
        { status: 401 },
      )
    }

    // 4.Get the form data: name, description, price, images

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const mrp = parseFloat(formData.get("price") as string)
    const price = Math.round(mrp * 100) / 100 // Round to 2 decimal places
    const category = formData.get("category") as string
    const images = formData.getAll("images") as File[]

    // 5. Validate input
    if (!name || !description || !price || images.length === 0) {
      return NextResponse.json(
        { error: "Missing product fields" },
        { status: 400 },
      )
    }

    // 6. Upload images
    const uploadedImageUrls = await Promise.all(
      images.map(async (image) => {
        const imageUrl = await uploadAndOptimizeImage(image, "products")
        return imageUrl
      }),
    )

    // 2. Check if the store belongs to the user
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store || store.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to add products to this store" },
        { status: 403 },
      )
    }

    // 3. Create the product
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: uploadedImageUrls,
        storeId,
      },
    })

    // 4. Return the created product
    return NextResponse.json(
      { newProduct, message: "Product created successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.log("[PRODUCT_POST]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// GEt all products for a store
export async function GEt(request: NextRequest) {
  try {
    // 1. get the Authenticated userID

    const { userId } = getAuth(request)

    // 2. Get the store ID using the userID
    const storeId = await userStoreID(userId!)

    // 3. Check if storeId exists
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized to add products to this store" },
        { status: 401 },
      )
    }

    // 4.Get the form data: name, description, price, images
    const products = await prisma.product.findMany({
      where: { storeId },
    })

    // 4. Return the created product
    return NextResponse.json(
      { products, message: "Products retrieved successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.log("[PRODUCT_POST]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
