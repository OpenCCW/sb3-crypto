// 逆向代码：
//   在 vendor~main 搜 .AES.
//   在 vendor~main 搜 .split(",")))
//   在 vendor~main 搜 .endsWith(".sb3")

import parseBase64 from "parse-base64-like-crypto-js";

export const cryptoTransform = async (
    mode: "encrypt" | "decrypt",
    fileName: string,
    data: BufferSource
): Promise<ArrayBuffer> => {
    // fileName 去掉前面的路径，去掉 ".sb3" 扩展名
    let i = fileName.lastIndexOf('/')
    if (i !== -1)
        fileName = fileName.slice(i)
    if (fileName.endsWith(".sb3"))
        fileName = fileName.slice(0, -4)

    let keyBytes = parseBase64("KzdnFCBRvq3" + fileName, false, 32)

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