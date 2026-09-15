// 逆向代码：
//   在 vendor~main 搜 .AES.
//   在 vendor~main 搜 .generateAsync({
//   在 vendor~main 搜 ["b", "x", "e", "y", "g", "i", "u", "c", "1", "2", "c"]

import JSZip from "jszip";
import { cryptoTransform } from "./crypto-transform.js";
import { bytesToBase64 } from "./to-base64.js";
import { u8aJoin } from "./u8a-join.js";

export const encryptProjectJson = async (projectJson: string, fileName: string): Promise<string> => {
    let b64json = btoa(encodeURIComponent(projectJson));
    const n = b64json.length % 10;
    b64json = b64json.slice(0, n) + 'bxeygiuc12'[n] + b64json.slice(n + 1) + b64json.charAt(n)

    const zip = new JSZip();
    zip.file("project.json", b64json);
    const sb3Bytes = await zip.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: {
            level: 6,
        },
    });

    const cipherData = u8aJoin(sb3Bytes)
    const encryptedBuffer = await cryptoTransform("encrypt", fileName, cipherData);
    return bytesToBase64(new Uint8Array(encryptedBuffer))
}
