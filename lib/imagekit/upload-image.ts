import imagekit from "./client"

type UploadType = "logos" | "products" | "avatars"

const CONFIG = {
  logos: { folder: "logos", width: 400, height: 400 },
  products: { folder: "products", width: 1000, height: 1000 },
  avatars: { folder: "avatars", width: 200, height: 200 },
}

export async function uploadAndOptimizeImage(file: File, type: UploadType) {
  const config = CONFIG[type]

  // 1. Upload to ImageKit
  const response = await imagekit.files.upload({
    file: file,
    fileName: file.name,
    folder: config.folder,
  })

  // 2. Generate Optimized URL
  const optimizedUrl = imagekit.helper.buildSrc({
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    src: response.url!,
    transformation: [
      {
        quality: 80,
        format: "auto",
        width: config.width.toString(),
        height: config.height.toString(),
        crop: "at_max",
      },
    ],
  })

  return optimizedUrl
}
