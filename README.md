基于 Web Crypto API + JSZip 实现 CCW sb3 文件的加密和解密。

## 安装

### npm

```
npm i @openccw/sb3-crypto
```

```js
import sb3Crypto from "@openccw/sb3-crypto";
```

### 其它包管理器

你也可以使用其它包管理器（例如 `pnpm` 或 `yarn`）代替 `npm` 。

## 使用

### 解密

解密并返回 `project.json` ：

```js
const projectLink = `https://m.ccw.site/user_projects_sb3/199431844/3c78eda3fb43e94c6b8cc892d493359b.sb3`

const projectLinkURL = new URL(projectLink)

// 从网络获取 sb3 文件。
// 文件名不是 MD5 ，同名文件的内容是可变的，所以不使用缓存。
projectLinkURL.searchParams.append('t', Date.now().toString())
const response = await fetch(projectLink, { cache: 'no-store' })
if (!response.ok) {
    throw Error(`failed to fetch: HTTP ${response.status} ${response.statusText}`)
}
const data = await response.arrayBuffer()

// 获取文件名
projectLinkURL.href = response.url
let sb3FileName = projectLinkURL.pathname
sb3FileName = sb3FileName.slice(sb3FileName.lastIndexOf('/') + 1)

// 解密并返回 project.json (string)
const decryptedProjectJson = await sb3Crypto.decrypt.decryptToProjectJson(data, sb3FileName)

console.log('project.json', decryptedProjectJson)
```

也可以解密并返回 sb3 文件：

```js
// 解密并返回 sb3 (Uint8Array)
const decryptedSb3 = await sb3Crypto.decrypt.decryptToSb3(data, sb3FileName)
```

### 加密

加密 `project.json` 并返回 sb3 ：

```js
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

// 加密 project.json 并返回 sb3 (string)
const encryptedSb3 = await sb3Crypto.encrypt.encryptProjectJson(projectJson, sb3FileName)

// sb3 字符串转字节数组
const encryptedSb3Bytes = new TextEncoder().encode(encryptedSb3)
```
