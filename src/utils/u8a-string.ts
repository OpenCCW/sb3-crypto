// 优化 "0,127,255" 格式的编解码性能

// ',': 44
// '0': 48
// '9': 57

let _decoder: TextDecoder | undefined;

/** 快速模拟 `Uint8Array.from(new TextDecoder().decode(u8a).split(","))` */
export const u8aSplit = (u8a: Uint8Array): Uint8Array<ArrayBuffer> => {
    const u8aLen = u8a.length
    // "".split(",") -> [""] -> [0]
    if (!u8aLen) return new Uint8Array(1)

    let outLen = 1
    // count ','
    for (let ii = 0; ii < u8aLen; ii++) {
        if (u8a[ii] === 44) outLen++
    }

    const out = new Uint8Array(outLen);
    // 快路径单遍扫描
    let oi = 0
    let value = 0
    for (let i = 0, start = 0; i < u8aLen; i++) {
        const c = u8a[i]
        if (c >= 48 && c <= 57) {
            // [快路径] 纯十进制累加，每个字符仅访问一次
            value = c - 48 + value * 10
        } else if (c === 44) {
            // [快路径] 遇到逗号直接结算
            out[oi++] = value
            value = 0
            start = i + 1
        } else {
            // [慢路径] 发现非数字字符，子循环快速扫描到本 token 结尾
            let end = i + 1
            while (end < u8aLen && u8a[end] !== 44) {
                end++
            }
            // 局部回退解析
            _decoder ??= new TextDecoder;
            out[oi++] = +_decoder.decode(u8a.subarray(start, end))
            // 指针跳过整个慢路径 token（本轮结束后 i++ 会正好跳过逗号，落在下一个 token 的首字符）
            i = end
            start = end + 1
            value = 0
        }
    }
    if (oi < outLen) out[oi] = value
    return out
}

const DIGIT_LENS = /* @__PURE__ */ new Uint8Array(256).fill(1, 0, 10).fill(2, 10, 100).fill(3, 100)

/** 快速模拟 `new TextEncoder().encode(u8a.join())` */
export const u8aJoin = (u8a: Uint8Array): Uint8Array<ArrayBuffer> => {
    const u8aLen = u8a.length
    if (!u8aLen) return new Uint8Array;

    let outLen = u8aLen - 1
    for (let ii = 0; ii < u8aLen; ii++) {
        outLen += DIGIT_LENS[u8a[ii]]
    }

    const out = new Uint8Array(outLen)
    for (let ii = 0, oi = 0; ii < u8aLen; ii++) {
        const v = u8a[ii]
        if (v > 9) {
            // 10-255
            const d10 = 0 | (v / 10)
            if (d10 > 19) {
                // 200-255
                out[oi++] = 50
                out[oi++] = d10 + 28
            } else if (d10 > 9) {
                // 100-199
                out[oi++] = 49
                out[oi++] = d10 + 38
            } else {
                // 10-99
                out[oi++] = d10 + 48
            }
            out[oi++] = v - d10 * 10 + 48
        } else {
            // 0-9
            out[oi++] = v + 48
        }
        // ','
        if (oi < outLen) out[oi++] = 44
    }
    return out
}
