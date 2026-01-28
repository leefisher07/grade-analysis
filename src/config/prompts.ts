/**
 * 评语提示词配置文件（动态加载版本）
 *
 * 说明：
 * - 本文件负责从 public/prompts.json 动态加载配置
 * - 支持三个学段：幼儿园、小学、初中
 * - 每个学段有 3 种评语风格
 * - 模板中支持的变量：
 *   - {name}: 学生姓名
 *   - {tags}: 学生标签（自动用顿号连接）
 *   - {gender}: 他/她
 *
 * 修改提示词的方法（无需重新打包！）：
 * 1. 打开 public/prompts.json 文件
 * 2. 使用任意文本编辑器（记事本、VS Code等）修改
 * 3. 保存文件
 * 4. 刷新浏览器即可生效（无需重新打包！）
 *
 * 详细文档：请查看 提示词配置说明.md
 */

import { ref } from 'vue'

export interface PromptTemplate {
  style: string
  name: string
  description: string
  template: string
}

export interface PromptsConfig {
  metadata: {
    version: string
    lastUpdated: string
    description: string
    variables: Record<string, string>
  }
  kindergarten: PromptTemplate[]
  primary: PromptTemplate[]
  middle: PromptTemplate[]
  default: {
    template: string
  }
}

// 提示词配置的响应式存储
const promptsConfig = ref<PromptsConfig | null>(null)

// 加载提示词配置（从 public/prompts.json）
async function loadPromptsConfig(): Promise<PromptsConfig> {
  try {
    const response = await fetch('/prompts.json')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    promptsConfig.value = data
    console.log('[Prompts] 提示词配置加载成功')
    return data
  } catch (error) {
    console.error('[Prompts] 加载提示词配置失败:', error)
    // 返回默认配置
    return getDefaultConfig()
  }
}

// 获取默认配置（当加载失败时使用）
function getDefaultConfig(): PromptsConfig {
  return {
    metadata: {
      version: '1.0.0',
      lastUpdated: '2026-01-20',
      description: '默认提示词配置',
      variables: { name: '学生姓名', tags: '学生标签', gender: '他/她' }
    },
    kindergarten: [
      {
        style: 'lively-horse',
        name: '活泼小马',
        description: '活泼充满童趣',
        template: '{name}是一个{tags}的孩子。{gender}在幼儿园表现很好。'
      }
    ],
    primary: [
      {
        style: 'dragon-horse',
        name: '龙马精神',
        description: '充满能量',
        template: '{name}是一个{tags}的学生。{gender}学习认真。'
      }
    ],
    middle: [
      {
        style: 'galloping',
        name: '策马扬鞭',
        description: '鼓励前行',
        template: '{name}是一个{tags}的学生。{gender}勤奋努力。'
      }
    ],
    default: {
      template: '{name}是一个{tags}的学生。希望{gender}继续努力！'
    }
  }
}

// 初始化：自动加载配置
let configPromise: Promise<PromptsConfig> | null = null

function ensureConfigLoaded(): Promise<PromptsConfig> {
  if (!configPromise) {
    configPromise = loadPromptsConfig()
  }
  return configPromise
}

// 导出各学段的提示词（异步获取）
export async function getKindergartenPrompts(): Promise<PromptTemplate[]> {
  const config = await ensureConfigLoaded()
  return config.kindergarten
}

export async function getPrimaryPrompts(): Promise<PromptTemplate[]> {
  const config = await ensureConfigLoaded()
  return config.primary
}

export async function getMiddlePrompts(): Promise<PromptTemplate[]> {
  const config = await ensureConfigLoaded()
  return config.middle
}

// 合并所有提示词配置（用于快速查找）
export async function getAllPrompts(): Promise<Record<string, string>> {
  const config = await ensureConfigLoaded()
  return {
    ...Object.fromEntries(config.kindergarten.map(p => [p.style, p.template])),
    ...Object.fromEntries(config.primary.map(p => [p.style, p.template])),
    ...Object.fromEntries(config.middle.map(p => [p.style, p.template]))
  }
}

// 同步版本（用于兼容现有代码）
export const allPrompts: Record<string, string> = {}
export let defaultPrompt = '{name}是一个{tags}的学生。希望{gender}继续努力！'

// 初始化同步数据
ensureConfigLoaded().then(config => {
  Object.assign(allPrompts, {
    ...Object.fromEntries(config.kindergarten.map(p => [p.style, p.template])),
    ...Object.fromEntries(config.primary.map(p => [p.style, p.template])),
    ...Object.fromEntries(config.middle.map(p => [p.style, p.template]))
  })
  defaultPrompt = config.default.template
})

/**
 * 渲染提示词模板
 * @param template 模板字符串
 * @param data 数据对象
 * @returns 渲染后的评语
 */
export function renderPrompt(template: string, data: { name: string; tags: string; gender: string }): string {
  return template
    .replace(/{name}/g, data.name)
    .replace(/{tags}/g, data.tags)
    .replace(/{gender}/g, data.gender)
}

/**
 * 获取所有提示词配置（用于管理界面）
 * @returns 完整的提示词配置对象
 */
export function getAllPromptsConfig(): PromptsConfig {
  return prompts
}

/**
 * 根据风格ID获取提示词模板
 * @param style 风格ID
 * @returns 提示词模板字符串，如果未找到则返回默认模板
 */
export function getPromptByStyle(style: string): string {
  return allPrompts[style] || defaultPrompt
}
