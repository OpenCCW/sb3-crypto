// 部分代码参考自 BenPaoDeXiaoZhi (MengFuzi)

import JSZip from "jszip";
import { cryptoTransform } from "./crypto-transform.js";
import { bytesToBase64 } from "./to-base64.js";
import { u8aJoin } from "./u8a-join.js";

export const encryptProjectJson = async (projectJson: string, fileName: string): Promise<string> => {
    let b64json = btoa(encodeURIComponent(projectJson));
    const n = b64json.length % 10;
    b64json = b64json.slice(0, n) + 'bxeygiuc12c'[n] + b64json.slice(n + 1) + b64json[n]

    const sb3 = new JSZip();
    sb3.file("project.json", b64json);
    const sb3Bytes = await sb3.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: {
            level: 6,
        },
    });

    const data = u8aJoin(sb3Bytes)
    const encryptedBuffer = await cryptoTransform("encrypt", fileName, data);
    return bytesToBase64(new Uint8Array(encryptedBuffer))
}
