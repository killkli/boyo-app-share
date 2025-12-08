import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface S3Config {
  endpoint: string
  accessKey: string
  secretKey: string
  bucket: string
  baseUrl: string
}

let s3Client: S3Client | null = null

/**
 * 取得 S3 設定
 * 可用於測試環境的依賴注入
 */
const getConfig = (customConfig?: Partial<S3Config>): S3Config => {
  // 如果提供自訂配置（測試環境），使用它
  if (customConfig) {
    return {
      endpoint: customConfig.endpoint || 'https://s3.tebi.io',
      accessKey: customConfig.accessKey || 'test-key',
      secretKey: customConfig.secretKey || 'test-secret',
      bucket: customConfig.bucket || 'test-bucket',
      baseUrl: customConfig.baseUrl || 'https://s3.tebi.io/test-bucket'
    }
  }

  // 在 Nuxt 環境中使用 runtime config
  const runtimeConfig = useRuntimeConfig()
  return {
    endpoint: runtimeConfig.tebiEndpoint,
    accessKey: runtimeConfig.tebiAccessKey,
    secretKey: runtimeConfig.tebiSecretKey,
    bucket: runtimeConfig.tebiBucket,
    baseUrl: runtimeConfig.public.s3BaseUrl
  }
}

const getS3Client = (config: S3Config) => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    })
  }
  return s3Client
}

export const uploadToS3 = async (
  key: string,
  body: string | Buffer,
  contentType: string,
  options: { cacheControl?: string; config?: Partial<S3Config> } = {}
) => {
  const config = getConfig(options.config)
  const client = getS3Client(config)

  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl: options.cacheControl || 'public, max-age=31536000',
  }))

  return `${config.baseUrl}/${key}`
}

export const deleteFromS3 = async (key: string, customConfig?: Partial<S3Config>) => {
  const config = getConfig(customConfig)
  const client = getS3Client(config)

  await client.send(new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  }))
}

export const getPresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn: number = 3600,
  customConfig?: Partial<S3Config>
) => {
  const config = getConfig(customConfig)
  const client = getS3Client(config)

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })

  return await getSignedUrl(client, command, { expiresIn })
}
