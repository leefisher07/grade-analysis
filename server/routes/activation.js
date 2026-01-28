/**
 * 激活码验证路由
 *
 * POST /api/activation/verify
 * 功能：验证激活码是否有效
 */

import express from 'express'
import { getActivation } from '../utils/storage.js'

const router = express.Router()

/**
 * 验证激活码
 * Body: { code: string }
 * Response: { valid: boolean, remainingQuota?: number, message?: string }
 */
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body

    // 参数验证
    if (!code || typeof code !== 'string' || code.length !== 8) {
      return res.status(400).json({
        valid: false,
        message: '激活码格式错误（应为8位字符）'
      })
    }

    // 查询激活码
    const activation = await getActivation(code)

    if (!activation) {
      return res.json({
        valid: false,
        message: '激活码不存在或已失效'
      })
    }

    // 返回激活码信息
    res.json({
      valid: true,
      remainingQuota: activation.remainingQuota,
      activatedAt: activation.activatedAt,
      message: '激活码验证成功'
    })

    console.log(`[Activation] 激活码 ${code} 验证成功，剩余额度: ${activation.remainingQuota}`)

  } catch (error) {
    console.error('[Activation] 验证失败:', error)
    res.status(500).json({
      valid: false,
      message: '服务器错误，请稍后重试'
    })
  }
})

export default router
