import { prisma } from "@/lib/prisma"

export async function userStoreID(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        store: true,
      },
    })
    if (user && user.store && user.store.status === "approved") {
      return user.store.id
    }
  } catch (error) {
    console.log("[USER_STORE_ID]", error)
    return ""
  }
  return ""
}
