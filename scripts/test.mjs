import sb3Crypto from "@openccw/sb3-crypto";
import assert from "node:assert";
import fs from 'node:fs'
import path from "node:path";

const inputDir = 'testdata/input'
const outputDir = 'testdata/output'
const outputDecryptDir = outputDir + '/decrypt'
const outputEncryptDir = outputDir + '/encrypt'

fs.rmSync(outputDir, { recursive: true, force: true })
fs.mkdirSync(outputDir)
fs.mkdirSync(outputDecryptDir)
fs.mkdirSync(outputEncryptDir)

for (const inputFileStat of fs.readdirSync(inputDir, { withFileTypes: true })) {
    const inputFileName = inputFileStat.name;
    if (!inputFileStat.isFile() || !inputFileName.endsWith('.sb3'))
        continue;

    const outputEncryptFileName = inputFileName.replace(/\.sb3$/, '.json')

    const inputFilePath = path.join(inputDir, inputFileName)
    const outputDecryptJsonFilePath = path.join(outputDecryptDir, outputEncryptFileName)
    const outputDecryptSb3FilePath = path.join(outputDecryptDir, inputFileName)
    const outputEncryptFilePath = path.join(outputEncryptDir, inputFileName)

    console.log('decrypt', inputFilePath)
    const inputFileData = fs.readFileSync(inputFilePath)
    const decryptedProjectJson = await sb3Crypto.decrypt.decryptToProjectJson(inputFileData, inputFileName)
    fs.writeFileSync(outputDecryptJsonFilePath, decryptedProjectJson)
    const decryptedSb3 = await sb3Crypto.decrypt.decryptToSb3(inputFileData, inputFileName)
    fs.writeFileSync(outputDecryptSb3FilePath, decryptedSb3)

    console.log('encrypt', outputDecryptJsonFilePath)
    const encryptedSb3 = await sb3Crypto.encrypt.encryptProjectJson(decryptedProjectJson, inputFileName)
    fs.writeFileSync(outputEncryptFilePath, encryptedSb3)

    console.log('decrypt-again', outputEncryptFilePath)
    const decryptedProjectJson2 = await sb3Crypto.decrypt.decryptToProjectJson(Buffer.from(encryptedSb3), inputFileName)

    console.log('compare json')
    assert.strictEqual(
        decryptedProjectJson,
        decryptedProjectJson2,
        `not equal`
    )

    console.log('parse json')
    JSON.parse(decryptedProjectJson)

    console.log()
}

console.log('ok')
