import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!
const PRESIGNED_TTL_SECONDS = 300 // 5 min

export async function generatePresignedUploadUrl(
  userId: string,
  analysisId: string,
  angle: 'front' | 'back'
): Promise<{ url: string; key: string }> {
  const key = `uploads/${userId}/${analysisId}/${angle}.jpg`
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: 'image/jpeg',
  })
  const url = await getSignedUrl(s3, command, { expiresIn: PRESIGNED_TTL_SECONDS })
  return { url, key }
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export function extractKeyFromUrl(url: string): string {
  const urlObj = new URL(url)
  return urlObj.pathname.slice(1) // remove leading /
}
