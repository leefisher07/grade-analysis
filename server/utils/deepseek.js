/**
 * DeepSeek API 调用工具
 *
 * 功能：
 * - 封装 DeepSeek API 调用
 * - 错误处理和重试机制
 * - 请求日志记录
 */

import axios from 'axios'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const API_KEY = process.env.DEEPSEEK_API_KEY

if (!API_KEY) {
  console.error('❌ 错误：未设置 DEEPSEEK_API_KEY 环境变量')
  process.exit(1)
}

/**
 * 调用 DeepSeek API 生成评语
 * @param {string} systemPrompt 系统提示词
 * @param {string} userPrompt 用户提示词
 * @param {number} retries 重试次数
 * @returns {Promise<string>} 生成的评语
 */
export async function callDeepSeekAPI(systemPrompt, userPrompt, retries = 2) {
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[DeepSeek] 调用 API (尝试 ${attempt + 1}/${retries + 1})...`)

      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          timeout: 30000 // 30秒超时
        }
      )

      const comment = response.data.choices[0].message.content.trim()
      console.log(`[DeepSeek] ✅ 生成成功，字数: ${comment.length}`)
      return comment

    } catch (error) {
      lastError = error
      console.error(`[DeepSeek] ❌ 尝试 ${attempt + 1} 失败:`, error.message)

      // 如果不是最后一次尝试，等待后重试
      if (attempt < retries) {
        const waitTime = (attempt + 1) * 1000 // 递增等待时间
        console.log(`[DeepSeek] ⏳ 等待 ${waitTime}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  // 所有重试都失败
  console.error(`[DeepSeek] ❌ API 调用失败，已重试 ${retries} 次`)
  throw new Error(`DeepSeek API 调用失败: ${lastError.message}`)
}

/**
 * 测试 API 连接
 * @returns {Promise<boolean>}
 */
export async function testAPIConnection() {
  try {
    console.log('[DeepSeek] 测试 API 连接...')
    await callDeepSeekAPI(
      '你是一个测试助手',
      '请回复"连接成功"',
      0 // 不重试
    )
    console.log('[DeepSeek] ✅ API 连接测试成功')
    return true
  } catch (error) {
    console.error('[DeepSeek] ❌ API 连接测试失败:', error.message)
    return false
  }
}
