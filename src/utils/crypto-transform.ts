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
    // 去掉 ".sb3" 扩展名
    if (fileName.endsWith(".sb3"))
        fileName = fileName.slice(0, -4)
    // 去掉前面的路径
    const i = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'))
    if (i !== -1)
        fileName = fileName.slice(i + 1)
    // 取前 32 个字符
    // （逆向的代码里没有这个，但超出这个范围的字符都不会被使用）
    if (fileName.length > 32)
        fileName = fileName.slice(0, 32)

    const keyBytes = parseBase64("KzdnFCBRvq3" + fileName, false, 32)

    const name = "AES-CBC"
    const key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name },
        false,
        [mode]
    )
    return crypto.subtle[mode](
        { name, iv: keyBytes.subarray(0, 16) } as AesCbcParams,
        key,
        data
    )
}
