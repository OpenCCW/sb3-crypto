快速解密或加密 CCW 的 sb3 文件，基于 Web Crypto API + JSZip 实现。

在线使用: https://openccw.github.io/download-sb3/

> [!NOTE]  
> sb3 文件名去掉结尾的 `.sb3` 扩展名之后，前 32 个字符会被作为解密时使用的密钥。  
> 不得擅自重命名已加密的 sb3 文件。  

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
const response = await fetch(projectLinkURL, { cache: 'no-store' })
if (!response.ok) {
    throw Error(`failed to fetch: HTTP ${response.status} ${response.statusText}`)
}
const data = await response.arrayBuffer()

// 更新 URL（跟随重定向）
projectLinkURL.href = response.url

// 解密并返回 project.json（类型：字符串）
const decryptedProjectJson = await sb3Crypto.decrypt.decryptToProjectJson(data, projectLinkURL.pathname)

console.log('project.json', decryptedProjectJson)
```

也可以解密并返回 sb3 文件：

```js
// 解密并返回 sb3 (Uint8Array)
const decryptedSb3 = await sb3Crypto.decrypt.decryptToSb3(data, sb3FileName)
```

也可以解密并返回 JSZip 对象：

```js
// 解密并返回 JSZip 对象
const decryptedZip = await sb3Crypto.decrypt.decryptToJszip(data, sb3FileName)
```

也可以解密后自己处理返回的数据：

```js
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
 *   - `false` 则 `json` 未加密，返回的 `sb3` 和 `zip` 里的 `project.json` 未加密。  
 */
const { sb3, sb3IsCopied, zip, json, jsonIsDecrypted } = await sb3Crypto.decrypt.prepareDecrypt(data, fileName);
```

### 加密

输入 `project.json` ，返回已加密的 sb3（像Base64）：

```js
import md5 from "tinyhmacmd5"

// 假设这是 project.json
const projectJson = JSON.stringify({})

// 生成新文件名（不含扩展名）。
// 逆向 vendor~main 可以看到用了 md5 。
// 你也可以直接用 Math.random() 随机生成 32 个字符的 hex ：
//   let fileName = ""
//   while (fileName.length < 32) {
//     fileName += (0 | 16 * Math.random()).toString(16)
//   }
const fileName = md5('' + Date.now() + Math.random())

// 加密 project.json 并返回字符串
const encryptedSb3 = await sb3Crypto.encrypt.encryptProjectJson(projectJson, fileName)

// sb3 字符串转字节数组
const encryptedSb3Bytes = new TextEncoder().encode(encryptedSb3)
```
