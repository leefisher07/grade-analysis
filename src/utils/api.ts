/**
 * API 调用工具
 *
 * 功能：
 * - 封装所有服务器API调用
 * - 统一错误处理
 * - 类型安全
 */

// API 基础地址
const API_BASE_URL = 'http://8.134.89.239:3001/api'

// ========== 类型定义 ==========

export interface ActivationVerifyRequest {
  code: string
}

export interface ActivationVerifyResponse {
  valid: boolean
  remainingQuota?: number
  activatedAt?: string | null
  message?: string
}

export interface QuotaCheckResponse {
  remainingQuota: number
  activatedAt?: string
  lastUsedAt?: string
}

export interface GenerateCommentRequest {
  code: string
  prompt: string
  studentInfo: {
    name: string
    gender: string
    tags: string[]
  }
}

export interface GenerateCommentResponse {
  success: boolean
  comment: string
  remainingQuota: number
  error?: string
}

// ========== API 函数 ==========

/**
 * 验证激活码
 */
export async function verifyActivationCode(
  code: string
): Promise<ActivationVerifyResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/activation/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[API] 验证激活码失败:', error)
    throw new Error('网络连接失败，请检查网络设置')
  }
}

/**
 * 查询剩余额度
 */
export async function checkQuota(code: string): Promise<QuotaCheckResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/quota/check?code=${encodeURIComponent(code)}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[API] 查询额度失败:', error)
    throw new Error('查询额度失败，请稍后重试')
  }
}

/**
 * 生成评语
 */
export async function generateComment(
  request: GenerateCommentRequest
): Promise<GenerateCommentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/comment/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('[API] 生成评语失败:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('生成评语失败，请稍后重试')
  }
}

/**
 * 测试API连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    console.error('[API] 连接测试失败:', error)
    return false
  }
}
