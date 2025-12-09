#!/usr/bin/env node

/**
 * 創建測試帳號腳本
 * 用途：快速創建一個測試帳號用於開發和測試
 */

import bcrypt from 'bcryptjs'
import pg from 'pg'
import dotenv from 'dotenv'

const { Client } = pg

// 載入環境變數
dotenv.config()

async function createTestUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()
    console.log('✅ 資料庫連接成功')

    // 檢查是否已存在測試帳號
    const existing = await client.query(
      'SELECT id, email, username FROM users WHERE email = $1',
      ['demo@example.com']
    )

    if (existing.rows.length > 0) {
      console.log('\n⚠️  測試帳號已存在！')
      console.log('\n登入資訊：')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email:    demo@example.com')
      console.log('🔑 Password: demo1234')
      console.log('👤 Username:', existing.rows[0].username)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n登入網址: http://localhost:3000/login')
      return
    }

    // 創建測試帳號
    const passwordHash = await bcrypt.hash('demo1234', 10)

    const result = await client.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at`,
      ['demo@example.com', 'demouser', passwordHash]
    )

    const user = result.rows[0]

    console.log('\n✅ 測試帳號創建成功！')
    console.log('\n登入資訊：')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    demo@example.com')
    console.log('🔑 Password: demo1234')
    console.log('👤 Username:', user.username)
    console.log('🆔 User ID: ', user.id)
    console.log('📅 Created:  ', user.created_at)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n登入網址: http://localhost:3000/login')

  } catch (error) {
    console.error('\n❌ 錯誤:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

createTestUser()
