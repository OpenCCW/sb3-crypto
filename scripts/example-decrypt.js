import sb3Crypto from "@openccw/sb3-crypto";

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

// 获取文件名
projectLinkURL.href = response.url
let sb3FileName = projectLinkURL.pathname
sb3FileName = sb3FileName.slice(sb3FileName.lastIndexOf('/') + 1)

// 解密并返回 project.json (string)
const decryptedProjectJson = await sb3Crypto.decrypt.decryptToProjectJson(data, sb3FileName)

console.log('project.json', decryptedProjectJson)

// 解密并返回 sb3 (Uint8Array)
// const decryptedSb3 = await sb3Crypto.decrypt.decryptToSb3(data, sb3FileName)
