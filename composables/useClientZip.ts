import JSZip from 'jszip'

/**
 * Utilities for client-side ZIP handling
 */
export const useClientZip = () => {
    /**
     * Packs multiple files into a ZIP blob
     * @param files Record of filename -> content (string)
     * @returns Blob of the zip file
     */
    const packFiles = async (files: Record<string, string>) => {
        const zip = new JSZip()

        for (const [filename, content] of Object.entries(files)) {
            zip.file(filename, content)
        }

        return await zip.generateAsync({ type: 'blob' })
    }

    /**
     * Unpacks a ZIP blob into a record of files
     * @param blob ZIP file blob or arraybuffer
     * @returns Record of filename -> content (string)
     */
    const unpackFiles = async (data: Blob | ArrayBuffer | Uint8Array): Promise<Record<string, string>> => {
        const zip = await JSZip.loadAsync(data)
        const files: Record<string, string> = {}

        // Iterate through all files
        // Using Promise.all to load in parallel
        const promises = Object.keys(zip.files).map(async (filename) => {
            const file = zip.files[filename]
            if (!file.dir) {
                // Build a robust way to check if text
                // For now, try to read as text. If it fails or looks binary, we might need handling
                // But for this "Vibe Coding" context, we mostly care about text.
                try {
                    const content = await file.async('string')
                    files[filename] = content
                } catch (e) {
                    console.warn(`Failed to read ${filename} as string`, e)
                }
            }
        })

        await Promise.all(promises)
        return files
    }

    return {
        packFiles,
        unpackFiles
    }
}
