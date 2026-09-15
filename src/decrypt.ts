// 逆向代码：
//   在 vendor~main 搜 .AES.
//   在 vendor~main 搜 .split(",")))

import JSZip from "jszip";
import parseBase64 from "parse-base64-like-crypto-js";
import { cryptoTransform } from "./utils/crypto-transform.js";
import { u8aSplit } from "./utils/u8a-join.js";

const _decryptSb3 = async (data: Uint8Array, fileName: string): Promise<{
    sb3: Uint8Array,
    sb3IsCopied: boolean
}> => {
    if (data.length < 8)
        throw Error(`failed to decrypt sb3: data must have at least 8 bytes`);

    // 若 data[2] 不是可见的 ASCII 字符，则 data 是二进制数据。
    switch (data[0] << 16 | data[1] << 8 | data[2]) {
        case 0x504b03:
            // PK ....
            // [80, 75, 3, 4, 10, 0, 0, 0]
            // 未加密。
            return { sb3: data, sb3IsCopied: false }
        case 0x377abc:
            // 7z ....
            // [55, 122, 188, 175, 9, 5, 2, 7]
            // zip 头被改成 7z 头（混淆），这里把它改回来。
            // 为了防止 Buffer 类型导致意外情况，这里不能用 slice 。
            const sb3 = new Uint8Array(data);
            sb3[0] = 80
            sb3[1] = 75
            sb3[2] = 3
            sb3[3] = 4
            sb3[4] = 10
            sb3[5] = 0
            sb3[6] = 0
            sb3[7] = 0
            return { sb3, sb3IsCopied: true };
    }

    const cipherData = parseBase64(data)
    const decryptedBuffer = await cryptoTransform("decrypt", fileName, cipherData);
    return {
        sb3: u8aSplit(new Uint8Array(decryptedBuffer)),
        sb3IsCopied: true
    };
}

/**
 * 解密，然后自己处理返回的数据。  
 * ⚠️ 更自由，但 **需要更谨慎** 。  
 * - 返回的 `sb3IsCopied`
 *   - `true` 则返回的 `sb3` 已拷贝（经过解密），  
 *     但这 **不能** 代表返回的 `sb3` 和 `zip` 里的 `project.json` 是正确的。  
 *   - `false` 则返回的 `sb3` 未经过拷贝（无需解密），它就是输入的 `data` 参数的值，  
 *     但这 **不能** 代表返回的 `sb3` 和 `zip` 里的 `project.json` 是正确的。  
 * - 返回的 `jsonIsDecrypted`
 *   - `true` 则返回的 `json` 是经过解密的，`sb3` 和 `zip` 里的 `project.json` 未解密，  
 *     需自行 `zip.file("project.json", json)` ，然后自行使用 `zip.generateAsync` 生成新的 `sb3` 。  
 *   - `false` 则 `json` 未解密，返回的 `sb3` 和 `zip` 里的 `project.json` 未加密。  
 */
export const prepareDecrypt = async (data: Uint8Array | ArrayBuffer, fileName: string) => {
    if (data[Symbol.toStringTag] === 'ArrayBuffer')
        data = new Uint8Array(data);

    const { sb3, sb3IsCopied } = await _decryptSb3(data as Uint8Array, fileName);
    const zip = await JSZip.loadAsync(sb3);
    const jsonFile = zip.file("project.json")
    if (!jsonFile)
        throw new Error(`failed to decrypt sb3: "project.json" not found in archive`);
    let json = await jsonFile.async("text");

    const jsonIsEncrypted = /^[A-Za-z0-9+/]/.test(json);
    if (jsonIsEncrypted) {
        const t = json.length - 1
        const n = t % 10
        json = decodeURIComponent(atob(
            json.slice(0, n) + json.charAt(t) + json.slice(n + 1, t)
        ))
    }

    return {
        sb3,
        sb3IsCopied,
        zip,
        json,
        jsonIsDecrypted: jsonIsEncrypted
    };
}

/** 解密并返回 `Uint8Array` ，返回值经过拷贝。 */
export const decryptToSb3 = async (data: Uint8Array | ArrayBuffer, fileName: string): Promise<Uint8Array> => {
    const { sb3, sb3IsCopied, zip, json, jsonIsDecrypted } = await prepareDecrypt(data, fileName);

    if (!jsonIsDecrypted) return sb3IsCopied ? sb3 : new Uint8Array(sb3);

    zip.file("project.json", json)
    return zip.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: {
            level: 6,
        },
    })
}

/** 解密并返回 `project.json` */
export const decryptToProjectJson = async (data: Uint8Array | ArrayBuffer, fileName: string): Promise<string> => {
    const { json } = await prepareDecrypt(data, fileName);
    return json;
}

/** 解密并返回 `JSZip` */
export const decryptToJszip = async (data: Uint8Array | ArrayBuffer, fileName: string): Promise<JSZip> => {
    const { zip, json, jsonIsDecrypted } = await prepareDecrypt(data, fileName);
    if (jsonIsDecrypted) zip.file("project.json", json);
    return zip;
}
