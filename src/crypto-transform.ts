import parseBase64 from "parse-base64-like-crypto-js";

export const cryptoTransform = async (
    mode: "encrypt" | "decrypt",
    fileName: string,
    data: BufferSource
): Promise<ArrayBuffer> => {
    let keyBytes = parseBase64("KzdnFCBRvq3" + fileName).subarray(0, 32);
    if (keyBytes.length < 32) {
        const b = new Uint8Array(32)
        b.set(keyBytes)
        keyBytes = b
    }

    const name = "AES-CBC"
    const algorithm: AesCbcParams = {
        name,
        iv: keyBytes.subarray(0, 16)
    }
    const key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name },
        false,
        [mode]
    )
    return crypto.subtle[mode](algorithm, key, data)
}