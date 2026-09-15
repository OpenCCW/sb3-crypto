export const bytesToBase64: (bytes: Uint8Array<ArrayBuffer>) => string | Promise<string> = (
    typeof Uint8Array.prototype.toBase64 == 'function' // ES2026, Node.js v25
        ? (bytes) => bytes.toBase64()
        : typeof Buffer == 'function' && Buffer.prototype && typeof Buffer.prototype.base64Slice == 'function'
            // Deno: `Buffer.prototype.base64Slice` throws error when arguments are omitted
            // https://github.com/denoland/deno/issues/34286
            ? (bytes) => Buffer.prototype.base64Slice.call(bytes, 0, bytes.length) as string
            // polyfill
            : (bytes) => new Promise((resolve, reject) => {
                const fr = new FileReader;
                fr.onerror = () => reject(fr.error)
                fr.onload = () => {
                    const s = fr.result as string
                    resolve(s.slice(s.indexOf(',') + 1))
                }
                fr.readAsDataURL(new Blob([bytes]))
            })
)
