#!/usr/bin/env node

/**
 * 調試腳本：檢查收藏和我的作品功能
 * 使用方法：node scripts/debug-favorites.js <your-email> <your-password>
 */

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'

async function debugFavorites(email, password) {
  console.log('🔍 開始調試收藏和我的作品功能...\n')

  try {
    // 1. 登入
    console.log('1️⃣ 嘗試登入...')
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!loginResponse.ok) {
      const error = await loginResponse.text()
      console.error('❌ 登入失敗:', error)
      return
    }

    const { token, user } = await loginResponse.json()
    console.log('✅ 登入成功!')
    console.log(`   使用者: ${user.username} (${user.email})`)
    console.log(`   Token: ${token.substring(0, 20)}...\n`)

    // 2. 檢查我的作品
    console.log('2️⃣ 檢查我的作品...')
    const myAppsResponse = await fetch(`${API_BASE}/api/apps/my-apps`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!myAppsResponse.ok) {
      const error = await myAppsResponse.text()
      console.error('❌ 獲取我的作品失敗:', error)
    } else {
      const myAppsData = await myAppsResponse.json()
      console.log(`✅ 我的作品數量: ${myAppsData.total}`)
      if (myAppsData.apps.length > 0) {
        console.log('   前幾個作品:')
        myAppsData.apps.slice(0, 3).forEach(app => {
          console.log(`   - ${app.title} (ID: ${app.id})`)
        })
      } else {
        console.log('   ⚠️  您還沒有創建任何作品')
      }
    }
    console.log('')

    // 3. 檢查我的收藏
    console.log('3️⃣ 檢查我的收藏...')
    const favoritesResponse = await fetch(`${API_BASE}/api/apps/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!favoritesResponse.ok) {
      const error = await favoritesResponse.text()
      console.error('❌ 獲取收藏失敗:', error)
    } else {
      const favoritesData = await favoritesResponse.json()
      console.log(`✅ 收藏數量: ${favoritesData.total}`)
      if (favoritesData.apps.length > 0) {
        console.log('   收藏的應用:')
        favoritesData.apps.slice(0, 3).forEach(app => {
          console.log(`   - ${app.title} (ID: ${app.id})`)
        })
      } else {
        console.log('   ⚠️  您還沒有收藏任何應用')
      }
    }
    console.log('')

    // 4. 列出所有公開應用（可以用來測試收藏）
    console.log('4️⃣ 列出公開應用（可用於測試收藏）...')
    const appsResponse = await fetch(`${API_BASE}/api/apps?limit=5`)

    if (appsResponse.ok) {
      const appsData = await appsResponse.json()
      console.log(`✅ 共有 ${appsData.total} 個公開應用`)
      if (appsData.apps.length > 0) {
        console.log('   可以收藏的應用:')
        appsData.apps.forEach(app => {
          console.log(`   - ${app.title} (ID: ${app.id})`)
          console.log(`     收藏方法: curl -X POST ${API_BASE}/api/apps/${app.id}/favorite \\`)
          console.log(`               -H "Authorization: Bearer ${token.substring(0, 20)}..."`)
        })
      }
    }

    console.log('\n✨ 調試完成！')
    console.log('\n💡 如果數量為 0，請:')
    console.log('   1. 前往 /create 創建一個新應用')
    console.log('   2. 前往 /explore 收藏一個應用')
    console.log('   3. 重新運行此腳本檢查結果')

  } catch (error) {
    console.error('❌ 調試過程出錯:', error.message)
  }
}

// 從命令列參數獲取 email 和 password
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.log('使用方法: node scripts/debug-favorites.js <email> <password>')
  console.log('範例: node scripts/debug-favorites.js user@example.com password123')
  process.exit(1)
}

debugFavorites(email, password)
