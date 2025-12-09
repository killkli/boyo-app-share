import html2canvas from 'html2canvas'

/**
 * 從 HTML 內容生成縮圖
 * @param htmlContent - HTML 內容字串
 * @param options - 截圖選項
 * @returns Promise<Blob> - PNG 格式的 Blob
 */
export async function generateThumbnail(
  htmlContent: string,
  options: {
    width?: number
    height?: number
  } = {}
): Promise<Blob> {
  const { width = 1200, height = 630 } = options

  // 創建臨時容器
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    background: white;
  `

  // 創建 iframe 來隔離樣式
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    border: none;
  `

  container.appendChild(iframe)
  document.body.appendChild(container)

  try {
    // 寫入 HTML 內容到 iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      throw new Error('無法訪問 iframe 文檔')
    }

    iframeDoc.open()
    iframeDoc.write(htmlContent)
    iframeDoc.close()

    // 等待內容加載完成
    await new Promise<void>((resolve) => {
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('load', () => {
          setTimeout(resolve, 500) // 額外等待渲染
        })
      } else {
        setTimeout(resolve, 1000)
      }
    })

    // 截取 iframe 內容
    const iframeBody = iframeDoc.body
    if (!iframeBody) {
      throw new Error('iframe 內容為空')
    }

    // 使用 html2canvas 截圖
    const canvas = await html2canvas(iframeBody, {
      width,
      height,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // 轉換為 Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('無法生成縮圖'))
        }
      }, 'image/png', 0.9)
    })

    return blob
  } finally {
    // 清理臨時容器
    document.body.removeChild(container)
  }
}

/**
 * 將 Blob 轉換為 base64 字串
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      // 移除 data:image/png;base64, 前綴
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function useThumbnail() {
  return {
    generateThumbnail,
    blobToBase64
  }
}
