import parseBase64 from "parse-base64-like-crypto-js";

/** 加密算法名称 */
export const ALGORITHM = "AES-CBC"

export const fileNameToKey = async (fileName: string): Promise<{
    key: CryptoKey;
    iv: Uint8Array<ArrayBuffer>;
}> => {
    let keyBytes = parseBase64("KzdnFCBRvq3" + fileName).subarray(0, 32);
    if (keyBytes.length < 32) {
        const b = new Uint8Array(32)
        b.set(keyBytes)
        keyBytes = b
    }

    return {
        key: await crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: ALGORITHM },
            false,
            ["encrypt", "decrypt"]
        ),
        iv: keyBytes.subarray(0, 16)
    }
}