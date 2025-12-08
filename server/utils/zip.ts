import AdmZip from 'adm-zip'
import { getMimeType } from './mime'

export interface ZipFile {
  path: string
  content: Buffer
  size: number
  type: string
}

/**
 * 解壓縮 ZIP 檔案並返回所有檔案
 * @param zipBuffer ZIP 檔案的 Buffer
 * @returns 解壓後的檔案陣列
 */
export const extractZip = async (zipBuffer: Buffer): Promise<ZipFile[]> => {
  const zip = new AdmZip(zipBuffer)
  const entries = zip.getEntries()
  const files: ZipFile[] = []

  for (const entry of entries) {
    // 排除目錄條目
    if (!entry.isDirectory) {
      files.push({
        path: entry.entryName,
        content: entry.getData(),
        size: entry.header.size,
        type: getMimeType(entry.entryName)
      })
    }
  }

  return files
}

/**
 * 從檔案列表中尋找主 HTML 檔案
 * 優先順序：
 * 1. 根目錄的 index.html
 * 2. 任何子目錄的 index.html
 * 3. 任何 .html 或 .htm 檔案
 * 
 * @param files 檔案列表
 * @returns 主 HTML 檔案的路徑，如果找不到則返回 null
 */
export const findMainHtml = (files: ZipFile[]): string | null => {
  // 1. 優先尋找根目錄的 index.html
  const rootIndex = files.find(f => f.path === 'index.html')
  if (rootIndex) return rootIndex.path

  // 2. 尋找任何 index.html（包含子目錄）
  const anyIndex = files.find(f => f.path.endsWith('/index.html') || f.path.endsWith('\\index.html'))
  if (anyIndex) return anyIndex.path

  // 3. 尋找任何 .html 或 .htm 檔案
  const anyHtml = files.find(f => f.path.endsWith('.html') || f.path.endsWith('.htm'))
  if (anyHtml) return anyHtml.path

  return null
}
