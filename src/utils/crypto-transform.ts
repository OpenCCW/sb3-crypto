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
    // fileName 去掉 ".sb3" 扩展名，去掉前面的路径
    a: {
        const hasExt = fileName.endsWith(".sb3")
        const end = fileName.length - (hasExt ? 4 : 0)
        for (let i = end; i;) {
            switch (fileName.charCodeAt(--i)) {
                case 47: // '/'
                case 92: // '\'
                    fileName = fileName.slice(i + 1, end)
                    break a
            }
        }
        if (hasExt) fileName = fileName.slice(0, end)
    }

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
