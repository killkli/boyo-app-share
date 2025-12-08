/**
 * Tebi S3 連線測試腳本
 * 用於驗證 S3 設定是否正確
 */

import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { config } from 'dotenv'

// 載入環境變數
config()

const TEBI_ENDPOINT = process.env.TEBI_ENDPOINT || 'https://s3.tebi.io'
const TEBI_ACCESS_KEY = process.env.TEBI_ACCESS_KEY
const TEBI_SECRET_KEY = process.env.TEBI_SECRET_KEY
const TEBI_BUCKET = process.env.TEBI_BUCKET

console.log('🔧 Tebi S3 連線測試\n')
console.log('設定資訊:')
console.log(`  Endpoint: ${TEBI_ENDPOINT}`)
console.log(`  Access Key: ${TEBI_ACCESS_KEY?.substring(0, 4)}****`)
console.log(`  Bucket: ${TEBI_BUCKET}`)
console.log('')

if (!TEBI_ACCESS_KEY || !TEBI_SECRET_KEY || !TEBI_BUCKET) {
  console.error('❌ 錯誤: 缺少必要的環境變數')
  console.error('請確認 .env 檔案包含:')
  console.error('  - TEBI_ACCESS_KEY')
  console.error('  - TEBI_SECRET_KEY')
  console.error('  - TEBI_BUCKET')
  process.exit(1)
}

// 建立 S3 客戶端
const s3Client = new S3Client({
  region: 'auto',
  endpoint: TEBI_ENDPOINT,
  credentials: {
    accessKeyId: TEBI_ACCESS_KEY,
    secretAccessKey: TEBI_SECRET_KEY,
  },
  forcePathStyle: true, // Tebi 需要使用 path-style
})

async function testS3Connection() {
  try {
    // 測試 1: 列出所有 buckets
    console.log('📋 測試 1: 列出 Buckets...')
    const listBucketsCommand = new ListBucketsCommand({})
    const bucketsResponse = await s3Client.send(listBucketsCommand)

    if (bucketsResponse.Buckets && bucketsResponse.Buckets.length > 0) {
      console.log('✅ 成功列出 Buckets:')
      bucketsResponse.Buckets.forEach(bucket => {
        console.log(`   - ${bucket.Name}`)
      })

      // 檢查目標 bucket 是否存在
      const bucketExists = bucketsResponse.Buckets.some(b => b.Name === TEBI_BUCKET)
      if (bucketExists) {
        console.log(`✅ Bucket "${TEBI_BUCKET}" 存在`)
      } else {
        console.warn(`⚠️  警告: Bucket "${TEBI_BUCKET}" 不存在`)
        console.log('   請在 Tebi 控制台建立此 bucket')
        return
      }
    } else {
      console.log('⚠️  沒有找到任何 bucket')
      return
    }

    console.log('')

    // 測試 2: 上傳測試檔案
    console.log('📤 測試 2: 上傳測試檔案...')
    const testKey = 'test/connection-test.txt'
    const testContent = `Tebi S3 連線測試\n時間: ${new Date().toISOString()}\n`

    const putCommand = new PutObjectCommand({
      Bucket: TEBI_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read',
    })

    await s3Client.send(putCommand)
    console.log(`✅ 成功上傳檔案: ${testKey}`)

    const publicUrl = `${TEBI_ENDPOINT}/${TEBI_BUCKET}/${testKey}`
    console.log(`   公開 URL: ${publicUrl}`)

    console.log('')

    // 測試 3: 讀取檔案
    console.log('📥 測試 3: 讀取檔案...')
    const getCommand = new GetObjectCommand({
      Bucket: TEBI_BUCKET,
      Key: testKey,
    })

    const getResponse = await s3Client.send(getCommand)
    const content = await getResponse.Body?.transformToString()
    console.log('✅ 成功讀取檔案')
    console.log('   內容:', content?.trim())

    console.log('')

    // 測試 4: 刪除測試檔案
    console.log('🗑️  測試 4: 清理測試檔案...')
    const deleteCommand = new DeleteObjectCommand({
      Bucket: TEBI_BUCKET,
      Key: testKey,
    })

    await s3Client.send(deleteCommand)
    console.log('✅ 成功刪除測試檔案')

    console.log('')
    console.log('🎉 所有測試通過！Tebi S3 設定正確')

  } catch (error: any) {
    console.error('\n❌ 測試失敗!')
    console.error('錯誤訊息:', error.message)

    if (error.Code) {
      console.error('錯誤代碼:', error.Code)
    }

    if (error.$metadata) {
      console.error('HTTP 狀態碼:', error.$metadata.httpStatusCode)
    }

    console.error('\n常見問題:')
    console.error('1. Access Key 或 Secret Key 不正確')
    console.error('2. Bucket 不存在或名稱錯誤')
    console.error('3. Bucket 權限設定錯誤')
    console.error('4. 網路連線問題')

    process.exit(1)
  }
}

// 執行測試
testS3Connection()
