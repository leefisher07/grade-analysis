/**
 * 额度管理路由
 *
 * GET /api/quota/check?code=xxx
 * 功能：查询激活码的剩余额度
 */

import express from 'express'
import { getActivation } from '../utils/storage.js'

const router = express.Router()

/**
 * 查询剩余额度
 * Query: code
 * Response: { remainingQuota: number, activatedAt?: string }
 */
router.get('/check', async (req, res) => {
  try {
    const { code } = req.query

    // 参数验证
    if (!code || typeof code !== 'string' || code.length !== 8) {
      return res.status(400).json({
        error: '激活码格式错误（应为8位字符）'
      })
    }

    // 查询激活码
    const activation = await getActivation(code)

    if (!activation) {
      return res.status(404).json({
        error: '激活码不存在或已失效'
      })
    }

    // 返回额度信息
    res.json({
      remainingQuota: activation.remainingQuota,
      activatedAt: activation.activatedAt,
      lastUsedAt: activation.lastUsedAt
    })

    console.log(`[Quota] 查询激活码 ${code}，剩余额度: ${activation.remainingQuota}`)

  } catch (error) {
    console.error('[Quota] 查询失败:', error)
    res.status(500).json({
      error: '服务器错误，请稍后重试'
    })
  }
})

export default router
