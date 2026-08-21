export const bytesToBase64 = (bytes: Uint8Array): string => (
    bytes.toBase64 // ES2026
        ? bytes.toBase64()
        : btoa(bytes.reduce((p, v) => p + String.fromCharCode(v), ''))
)
