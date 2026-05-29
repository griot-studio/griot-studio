import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

let _client: S3Client | null = null

function getClient(): S3Client {
  if (_client) return _client
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
  return _client
}

export interface UploadResult {
  r2Key: string
  publicUrl: string
}

/**
 * Download a remote URL and upload it to Cloudflare R2.
 * Falls back to returning the original URL when R2 is not configured (dev mode).
 */
export async function uploadFromUrl(
  sourceUrl: string,
  key: string,
  contentType: string = 'image/webp',
): Promise<UploadResult> {
  // Dev fallback: R2 not configured yet
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
    return { r2Key: key, publicUrl: sourceUrl }
  }

  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch source: ${response.status} ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const bucket = process.env.R2_BUCKET_NAME ?? 'griot-studio-media'

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  )

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`
  return { r2Key: key, publicUrl }
}

export function buildMediaKey(
  userId: string,
  generationId: string,
  index: number,
  ext: string = 'webp',
): string {
  return `${userId}/${generationId}/${index}.${ext}`
}
