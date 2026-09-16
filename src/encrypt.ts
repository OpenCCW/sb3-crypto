// 逆向代码：
//   在 vendor~main 搜 .AES.
//   在 vendor~main 搜 .generateAsync({
//   在 vendor~main 搜 ["b", "x", "e", "y", "g", "i", "u", "c", "1", "2", "c"]

import JSZip from "jszip";
import miniToBase64 from "mini-to-base64";
import { cryptoTransform } from "./utils/crypto-transform.js";
import { csbJoin } from "./utils/comma-separated-bytes.js";

/** 输入 `project.json` ，返回已加密的 sb3（像Base64） */
export const encryptProjectJson = async (projectJson: string, fileName: string): Promise<string> => {
    let b64json = btoa(encodeURIComponent(projectJson));
    const n = b64json.length % 10;
    b64json = b64json.slice(0, n) + 'bxeygiuc12'[n] + b64json.slice(n + 1) + b64json.charAt(n)

    const sb3Bytes = await (
        new JSZip()
            .file("project.json", b64json)
            .generateAsync({
                type: "uint8array",
                compression: "DEFLATE",
                compressionOptions: { level: 6 },
            })
    )

    const csb = csbJoin(sb3Bytes)
    const encryptedBuffer = await cryptoTransform("encrypt", fileName, csb)
    return miniToBase64(new Uint8Array(encryptedBuffer))
}
