/**
 * 激活状态管理
 *
 * 功能：
 * - 管理激活码和额度的本地存储
 * - 提供激活状态查询
 * - 额度同步
 */

const STORAGE_KEY = 'intelligent_comment_activation'

export interface ActivationData {
  activationCode: string
  remainingQuota: number
  activatedAt: string
  lastUsedAt: string
}

/**
 * 保存激活信息
 */
export function saveActivation(data: ActivationData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('[Activation] 激活信息已保存')
  } catch (error) {
    console.error('[Activation] 保存激活信息失败:', error)
  }
}

/**
 * 获取激活信息
 */
export function getActivation(): ActivationData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return null
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('[Activation] 读取激活信息失败:', error)
    return null
  }
}

/**
 * 更新剩余额度
 */
export function updateQuota(remainingQuota: number): void {
  const activation = getActivation()
  if (!activation) {
    console.warn('[Activation] 未找到激活信息，无法更新额度')
    return
  }

  activation.remainingQuota = remainingQuota
  activation.lastUsedAt = new Date().toISOString()
  saveActivation(activation)
  console.log(`[Activation] 额度已更新为: ${remainingQuota}`)
}

/**
 * 清除激活信息（退出登录）
 */
export function clearActivation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('[Activation] 激活信息已清除')
  } catch (error) {
    console.error('[Activation] 清除激活信息失败:', error)
  }
}

/**
 * 检查是否已激活
 */
export function isActivated(): boolean {
  return getActivation() !== null
}

/**
 * 获取激活码
 */
export function getActivationCode(): string | null {
  const activation = getActivation()
  return activation?.activationCode || null
}

/**
 * 获取剩余额度
 */
export function getRemainingQuota(): number {
  const activation = getActivation()
  return activation?.remainingQuota || 0
}
