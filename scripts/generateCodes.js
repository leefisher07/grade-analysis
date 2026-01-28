/**
 * 激活码生成脚本
 *
 * 功能：
 * - 生成200个8位激活码
 * - 格式：数字+字母+特殊符号混合
 * - 每个激活码初始额度500次
 * - 输出到 src/config/activationCodes.json
 *
 * 使用方法：
 * node scripts/generateCodes.js
 */

const fs = require('fs')
const path = require('path')

// 字符集定义
const NUMBERS = '0123456789'
const LETTERS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LETTERS_LOWER = 'abcdefghijklmnopqrstuvwxyz'
const SPECIAL_CHARS = '@#$%&*'

// 合并所有字符
const ALL_CHARS = NUMBERS + LETTERS_UPPER + LETTERS_LOWER + SPECIAL_CHARS

/**
 * 生成单个激活码
 * @param {number} length 激活码长度
 * @returns {string} 激活码
 */
function generateSingleCode(length = 8) {
  let code = ''

  // 确保至少包含一个数字、一个字母、一个特殊符号
  code += NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
  code += LETTERS_UPPER[Math.floor(Math.random() * LETTERS_UPPER.length)]
  code += SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)]

  // 填充剩余长度
  for (let i = code.length; i < length; i++) {
    code += ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)]
  }

  // 打乱顺序
  return code.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * 生成多个不重复的激活码
 * @param {number} count 激活码数量
 * @returns {string[]} 激活码数组
 */
function generateCodes(count = 200) {
  const codes = new Set()

  while (codes.size < count) {
    const code = generateSingleCode(8)
    codes.add(code)
  }

  return Array.from(codes)
}

/**
 * 保存激活码到JSON文件
 * @param {string[]} codes 激活码数组
 * @param {string} outputPath 输出路径
 */
function saveToJSON(codes, outputPath) {
  const data = {
    metadata: {
      totalCount: codes.length,
      initialQuota: 500,
      generatedAt: new Date().toISOString(),
      version: '1.0'
    },
    codes: codes.reduce((acc, code) => {
      acc[code] = {
        initialQuota: 500,
        remainingQuota: 500,
        createdAt: new Date().toISOString(),
        activatedAt: null,
        lastUsedAt: null
      }
      return acc
    }, {})
  }

  // 确保目录存在
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // 写入文件
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * 保存激活码列表到Excel友好格式（用于发放给用户）
 * @param {string[]} codes 激活码数组
 * @param {string} outputPath 输出路径
 */
function saveToCSV(codes, outputPath) {
  const csv = [
    '序号,激活码,初始额度,生成时间',
    ...codes.map((code, index) => `${index + 1},${code},500,${new Date().toISOString()}`)
  ].join('\n')

  fs.writeFileSync(outputPath, csv, 'utf-8')
}

// ========== 主程序 ==========

console.log('🚀 开始生成激活码...\n')

const startTime = Date.now()

// 生成200个激活码
console.log('📝 正在生成 200 个激活码...')
const codes = generateCodes(200)
console.log(`✅ 成功生成 ${codes.length} 个激活码\n`)

// 保存到JSON文件（用于服务器）
const jsonPath = path.join(__dirname, '../src/config/activationCodes.json')
console.log('💾 正在保存到 JSON 文件...')
saveToJSON(codes, jsonPath)
console.log(`✅ JSON 文件已保存到：${jsonPath}\n`)

// 保存到CSV文件（用于发放）
const csvPath = path.join(__dirname, '../激活码列表.csv')
console.log('💾 正在保存到 CSV 文件...')
saveToCSV(codes, csvPath)
console.log(`✅ CSV 文件已保存到：${csvPath}\n`)

const endTime = Date.now()
console.log(`⏱  总耗时：${((endTime - startTime) / 1000).toFixed(2)} 秒`)
console.log('\n🎉 激活码生成完成！')
console.log('\n📋 示例激活码：')
codes.slice(0, 5).forEach((code, index) => {
  console.log(`   ${index + 1}. ${code}`)
})
console.log('   ...\n')
console.log('📖 使用说明：')
console.log('   1. 服务器部署时使用：src/config/activationCodes.json')
console.log('   2. 发放给用户时使用：激活码列表.csv')
console.log('')
