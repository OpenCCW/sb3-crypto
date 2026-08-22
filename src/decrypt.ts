// 部分代码参考自 BenPaoDeXiaoZhi (MengFuzi)

import JSZip from "jszip";
import parseBase64 from "parse-base64-like-crypto-js";
import { cryptoTransform } from "./crypto-transform.js";

const _PK = Uint8Array.of(80, 75, 3, 4, 10, 0, 0, 0); // PK ....

const _decryptSb3 = async (data: Uint8Array, fileName: string): Promise<Uint8Array> => {
    if (data.length < 8)
        throw Error(`failed to decrypt sb3: data must have at least 8 bytes`);

    // 若 data[2] 不是可见的 ASCII 字符，则 data 是二进制数据。
    switch (data[0] << 16 | data[1] << 8 | data[2]) {
        case 0x504b03:
            // PK ....
            // [80, 75, 3, 4, 10, 0, 0, 0]
            return data
        case 0x377abc:
            // 7z ....
            // [55, 122, 188, 175, 9, 5, 2, 7]
            // 保持和输入数据一样的长度（前 8 字节将被签名覆盖），
            // 但必须保证长度不少于 8 字节，否则放不下签名。
            // 为了防止 Buffer 类型导致意外情况，这里不能用 slice 。
            const out = Uint8Array.from(data);
            out.set(_PK);
            return out;
    }

    const cipherData = parseBase64(new TextDecoder().decode(data))
    const decryptedBuffer = await cryptoTransform("decrypt", fileName, cipherData);
    const bytesString = new TextDecoder().decode(decryptedBuffer);
    return Uint8Array.from(bytesString.split(","));
}

const _decrypt = async (data: Uint8Array | ArrayBuffer, fileName: string, toSb3: boolean) => {
    if (data[Symbol.toStringTag] === 'ArrayBuffer')
        data = new Uint8Array(data);

    const sb3 = await _decryptSb3(data as Uint8Array, fileName);
    const zip = await JSZip.loadAsync(sb3);
    let json = await zip.file("project.json")!.async("text");

    if (/^[ \n\r\t]*\{/.test(json))
        return toSb3 ? sb3 : json;

    const t = json.length - 1
    const n = t % 10
    json = decodeURIComponent(atob(
        json.slice(0, +n) + json[t] + json.slice(+n + 1, t)
    ))

    if (!toSb3) return json;

    zip.file("project.json", json)
    return zip.generateAsync({ type: "uint8array" })
}

export const decryptToSb3 = (data: Uint8Array | ArrayBuffer, fileName: string) => (
    _decrypt(data, fileName, true) as Promise<Uint8Array>
)

export const decryptToProjectJson = (data: Uint8Array | ArrayBuffer, fileName: string) => (
    _decrypt(data, fileName, false) as Promise<string>
)
