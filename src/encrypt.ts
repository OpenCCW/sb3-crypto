// 部分代码参考自 BenPaoDeXiaoZhi (MengFuzi)

import JSZip from "jszip";
import { ALGORITHM, fileNameToKey } from "./key.js";
import { bytesToBase64 } from "./to-base64.js";

export const encryptProjectJson = async (projectJson: string, fileName: string): Promise<string> => {
    let b64json = btoa(encodeURIComponent(projectJson));
    const t = b64json.length;
    const n = t % 10;
    b64json = b64json.slice(0, n) + 'bxeygiuc12c'[n] + b64json.slice(n + 1) + b64json.charAt(n)

    const sb3 = new JSZip();
    sb3.file("project.json", b64json);
    const sb3Bytes = await sb3.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: {
            level: 6,
        },
    });

    const { key, iv } = await fileNameToKey(fileName);
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        new TextEncoder().encode(sb3Bytes.toString())
    )
    return bytesToBase64(new Uint8Array(encryptedBuffer))
}
