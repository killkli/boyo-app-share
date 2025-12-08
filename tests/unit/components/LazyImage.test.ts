import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LazyImage from '~/components/common/LazyImage.vue'

describe('LazyImage 組件', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn((element) => {
        // 模擬圖片進入視窗
        callback([{ isIntersecting: true, target: element }])
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  it('應該渲染佔位圖片', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test Image'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test Image')
  })

  it('應該在進入視窗時載入真實圖片', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test Image'
      }
    })

    // 等待組件更新
    await wrapper.vm.$nextTick()

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://example.com/image.png')
  })

  it('應該支援自定義佔位圖片', () => {
    const placeholder = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test Image',
        placeholder
      }
    })

    // 初始狀態應該顯示佔位圖片
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
  })

  it('應該在載入完成後加入 loaded class', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test Image'
      }
    })

    await wrapper.vm.$nextTick()

    // 模擬圖片載入完成
    const img = wrapper.find('img')
    await img.trigger('load')

    expect(wrapper.classes()).toContain('loaded')
  })

  it('應該處理載入失敗的情況', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/invalid-image.png',
        alt: 'Test Image'
      }
    })

    await wrapper.vm.$nextTick()

    // 模擬圖片載入失敗
    const img = wrapper.find('img')
    await img.trigger('error')

    expect(wrapper.classes()).toContain('error')
  })

  it('應該支援傳入 CSS class', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test Image',
        class: 'custom-class'
      }
    })

    expect(wrapper.classes()).toContain('custom-class')
  })
})
