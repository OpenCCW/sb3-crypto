import sb3Crypto from "@openccw/sb3-crypto";

// 假设这是 project.json
const projectJson = JSON.stringify({})

/** @param {Uint8Array} bytes */
const bytesToHex = (bytes) => (
    bytes.toHex // ES2026
        ? bytes.toHex()
        : bytes.reduce((p, v) => p + (v >> 4 && '') + v.toString(16), '')
)

// 生成完全随机的文件名
const sb3FileName = bytesToHex(crypto.getRandomValues(new Uint8Array(16))) + '.sb3'

// 加密 project.json 并返回 sb3 文件 (string)
const encryptedSb3 = await sb3Crypto.encrypt.encryptProjectJson(projectJson, sb3FileName)

// sb3 字符串转字节数组
const encryptedSb3Bytes = new TextEncoder().encode(encryptedSb3)
