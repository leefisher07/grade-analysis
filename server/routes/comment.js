/**
 * 评语生成路由（DeepSeek API 中转）
 *
 * POST /api/comment/generate
 * 功能：调用 DeepSeek API 生成评语，并扣除额度
 */

import express from 'express'
import { getActivation, updateQuota } from '../utils/storage.js'
import { callDeepSeekAPI } from '../utils/deepseek.js'

const router = express.Router()

/**
 * 生成评语
 * Body: {
 *   code: string,           // 激活码
 *   prompt: string,         // 提示词模板
 *   studentInfo: {          // 学生信息
 *     name: string,
 *     gender: string,
 *     tags: string[]
 *   }
 * }
 * Response: {
 *   success: boolean,
 *   comment: string,
 *   remainingQuota: number
 * }
 */
router.post('/generate', async (req, res) => {
  try {
    const { code, prompt, studentInfo } = req.body

    // ========== 1. 参数验证 ==========
    if (!code || !prompt || !studentInfo) {
      return res.status(400).json({
        error: '参数不完整，需要：code, prompt, studentInfo'
      })
    }

    if (!studentInfo.name || !studentInfo.gender || !studentInfo.tags) {
      return res.status(400).json({
        error: '学生信息不完整，需要：name, gender, tags'
      })
    }

    // ========== 2. 验证激活码并检查额度 ==========
    const activation = await getActivation(code)

    if (!activation) {
      return res.status(401).json({
        error: '激活码无效或已失效'
      })
    }

    if (activation.remainingQuota <= 0) {
      return res.status(403).json({
        error: '额度已用完，无法生成评语',
        remainingQuota: 0
      })
    }

    console.log(`[Comment] 开始生成评语：学生=${studentInfo.name}，激活码=${code}，当前额度=${activation.remainingQuota}`)

    // ========== 3. 构建完整的提示词 ==========
    const systemPrompt = '你是一位经验丰富的教师，擅长根据学生特点撰写个性化评语。'

    const userPrompt = `请根据以下模板和学生信息生成一段评语：

【评语模板】
${prompt}

【学生信息】
- 姓名：${studentInfo.name}
- 性别：${studentInfo.gender}
- 标签：${studentInfo.tags.join('、')}

【生成要求】
1. 严格保持模板的语言风格和结构
2. 内容具体生动，避免空洞表扬
3. 字数控制在100-150字
4. 直接输出评语内容，不要额外说明或标题
5. 自然融入学生的标签特点，使评语个性化

请直接生成评语：`

    // ========== 4. 调用 DeepSeek API ==========
    let comment
    try {
      comment = await callDeepSeekAPI(systemPrompt, userPrompt)
    } catch (apiError) {
      console.error(`[Comment] DeepSeek API 调用失败:`, apiError.message)
      return res.status(500).json({
        error: 'AI服务暂时不可用，请稍后重试',
        details: apiError.message
      })
    }

    // ========== 5. 扣除额度（仅在成功时） ==========
    const newQuota = activation.remainingQuota - 1
    await updateQuota(code, newQuota)

    console.log(`[Comment] ✅ 评语生成成功：学生=${studentInfo.name}，字数=${comment.length}，剩余额度=${newQuota}`)

    // ========== 6. 返回结果 ==========
    res.json({
      success: true,
      comment: comment,
      remainingQuota: newQuota
    })

  } catch (error) {
    console.error('[Comment] 生成评语失败:', error)
    res.status(500).json({
      error: '服务器错误，请稍后重试',
      details: error.message
    })
  }
})

/**
 * 批量生成评语（可选，用于未来优化）
 * POST /api/comment/batch-generate
 */
router.post('/batch-generate', async (req, res) => {
  try {
    const { code, students } = req.body

    // 验证激活码
    const activation = await getActivation(code)
    if (!activation) {
      return res.status(401).json({ error: '激活码无效' })
    }

    // 检查额度是否足够
    if (activation.remainingQuota < students.length) {
      return res.status(403).json({
        error: `额度不足，需要 ${students.length} 次，当前剩余 ${activation.remainingQuota} 次`
      })
    }

    res.json({
      message: '批量生成功能暂未开放，请使用单个生成功能',
      tip: '客户端会自动使用队列机制逐个生成'
    })

  } catch (error) {
    console.error('[Comment] 批量生成失败:', error)
    res.status(500).json({ error: '服务器错误' })
  }
})

export default router
