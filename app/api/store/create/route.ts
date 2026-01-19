import imagekit from "@/lib/imagekit/client"
import { uploadAndOptimizeImage } from "@/lib/imagekit/upload-image"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    // 1. Parse the form data: name, username, description, email, contact, address, image
    const formData = await request.formData()
    const name = formData.get("name") as string
    const username = formData.get("username") as string
    const description = formData.get("description") as string
    const email = formData.get("email") as string
    const contact = formData.get("contact") as string
    const address = formData.get("address") as string
    const image = formData.get("image") as File

    // 2. Validate the input
    if (
      !name ||
      !username ||
      !email ||
      !contact ||
      !address ||
      !image ||
      !description
    ) {
      return NextResponse.json(
        { error: "Missing store fields" },
        { status: 400 },
      )
    }

    //3. Check if user has already created a store
    const existingStore = await prisma.store.findFirst({
      where: { userId: userId! },
    })

    if (existingStore) {
      return NextResponse.json(
        { error: "User already has a store" },
        { status: 400 },
      )
    }

    // 4. Check if username is already taken
    const existingUsername = await prisma.store.findFirst({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 },
      )
    }

    // 5. Upload image
    const logoUrl = await uploadAndOptimizeImage(image, "logos")
    // 7. Create the store in the database
    const newStore = await prisma.store.create({
      data: {
        name,
        username: username.toLowerCase(),
        description,
        email,
        contact,
        address,
        logo: logoUrl,
        userId: userId!,
      },
    })
    // link the store to the user
    await prisma.user.update({
      where: { id: userId! },
      data: { store: { connect: { id: newStore.id } } },
    })

    // 8. Return the created store
    return NextResponse.json(
      {
        newStore,
        message: "Store created successfully",
      },
      {
        status: 201,
      },
    )
  } catch (error) {
    console.log("[STORE_POST]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// Check if user has already registered a store
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    const existingStore = await prisma.store.findFirst({
      where: { userId: userId! },
    })

    if (existingStore) {
      return NextResponse.json(
        { store: existingStore },
        {
          status: 200,
        },
      )
    } else {
      return NextResponse.json(
        { store: null },
        {
          status: 200,
        },
      )
    }
  } catch (error) {
    console.log("[STORE_GET]", error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
