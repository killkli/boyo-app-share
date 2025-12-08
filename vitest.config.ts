import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { config } from 'dotenv'

// 載入 .env 檔案
config()

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './'),
      '@': resolve(__dirname, './')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        'coverage/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
