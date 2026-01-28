/**
 * 数据存储工具
 *
 * 功能：
 * - 读写 JSON 文件
 * - 激活码数据管理
 * - 额度更新
 */

import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_FILE = path.join(__dirname, '../data/activations.json')

/**
 * 读取激活码数据
 * @returns {Promise<Object>} 激活码数据
 */
export async function readActivations() {
  try {
    if (!existsSync(DATA_FILE)) {
      console.error(`❌ 数据文件不存在: ${DATA_FILE}`)
      return { metadata: {}, codes: {} }
    }

    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取激活码数据失败:', error)
    throw error
  }
}

/**
 * 写入激活码数据
 * @param {Object} data 激活码数据
 */
export async function writeActivations(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('写入激活码数据失败:', error)
    throw error
  }
}

/**
 * 获取单个激活码信息
 * @param {string} code 激活码
 * @returns {Promise<Object|null>} 激活码信息
 */
export async function getActivation(code) {
  const data = await readActivations()
  return data.codes[code] || null
}

/**
 * 更新激活码的剩余额度
 * @param {string} code 激活码
 * @param {number} newQuota 新的剩余额度
 */
export async function updateQuota(code, newQuota) {
  const data = await readActivations()

  if (!data.codes[code]) {
    throw new Error('激活码不存在')
  }

  data.codes[code].remainingQuota = newQuota
  data.codes[code].lastUsedAt = new Date().toISOString()

  // 如果是首次激活，记录激活时间
  if (!data.codes[code].activatedAt) {
    data.codes[code].activatedAt = new Date().toISOString()
  }

  await writeActivations(data)
  console.log(`[Storage] 激活码 ${code} 额度更新为: ${newQuota}`)
}

/**
 * 获取激活码统计信息
 * @returns {Promise<Object>} 统计信息
 */
export async function getStatistics() {
  const data = await readActivations()
  const codes = Object.values(data.codes)

  return {
    totalCodes: codes.length,
    activatedCodes: codes.filter(c => c.activatedAt).length,
    totalQuotaUsed: codes.reduce((sum, c) => sum + (c.initialQuota - c.remainingQuota), 0),
    totalQuotaRemaining: codes.reduce((sum, c) => sum + c.remainingQuota, 0)
  }
}
