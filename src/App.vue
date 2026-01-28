<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Trash2, FileDown, FileUp, Printer, X, RefreshCw, Sparkles, Info, Settings, ChevronDown, ChevronUp, LogOut } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import Toast from './components/ui/Toast.vue'
import Tooltip from './components/ui/Tooltip.vue'
import LoginView from './components/LoginView.vue'
import { allPrompts, defaultPrompt, renderPrompt } from './config/prompts'
import { generateComment, checkQuota } from './utils/api'
import { RequestQueue } from './utils/requestQueue'
import { getActivation, getActivationCode, updateQuota as updateLocalQuota, clearActivation, isActivated as checkActivated } from './utils/activation'

type SchoolStage = 'kindergarten' | 'primary' | 'middle'

interface Student {
  id: number
  name: string
  gender: string
  tags: string[]
  style: string
  comment: string
  isGenerating: boolean
  isException: boolean // 标识是否为单独设置的风格（例外）
  hasError: boolean // 标识信息不足，无法生成评语
}

// 评语风格配置
const styleConfigs = {
  kindergarten: [
    {
      value: 'lively-horse',
      label: '活泼小马',
      description: '结合2026马年元素，把孩子比作可爱的‘小马驹’，活泼充满童趣。',
      tooltip: '结合2026马年元素，把孩子比作可爱的‘小马驹’，活泼充满童趣。'
    },
    {
      value: 'warm-gentle',
      label: '亲切温柔',
      description: '像妈妈一样的口吻，语气柔和，充满爱意和包容。',
      tooltip: '像妈妈一样的口吻，语气柔和，充满爱意和包容。'
    },
    {
      value: 'detail-narrative',
      label: '细节叙事',
      description: '侧重描述生活细节和具体画面，不会空洞地表扬。',
      tooltip: '侧重描述生活细节和具体画面，不会空洞地表扬。'
    }
  ],
  primary: [
    {
      value: 'dragon-horse',
      label: '龙马精神',
      description: '引用‘一马当先’、‘龙马精神’等成语，充满能量地给予评语。',
      tooltip: '引用‘一马当先’、‘龙马精神’等成语，充满能量地给予评语。'
    },
    {
      value: 'enthusiastic',
      label: '热情鼓励',
      description: '阳光积极，多用感叹句，侧重挖掘优点和自信心。',
      tooltip: '阳光积极，多用感叹句，侧重挖掘优点和自信心。'
    },
    {
      value: 'poetic',
      label: '诗意文采',
      description: '引用恰当的古诗文或名言，评语内容优美典雅。',
      tooltip: '引用恰当的古诗文或名言，评语内容优美典雅。'
    }
  ],
  middle: [
    {
      value: 'galloping',
      label: '策马扬鞭',
      description: '引用‘以梦为马’意象，鼓励学生在青春旷野全力奔跑。',
      tooltip: '引用‘以梦为马’意象，鼓励学生在青春旷野全力奔跑。'
    },
    {
      value: 'friendly-mentor',
      label: '亦师亦友',
      description: '平等对话，尊重个性，像与学生一样真诚交流。',
      tooltip: '平等对话，尊重个性，像与学生一样真诚交流。'
    },
    {
      value: 'rigorous',
      label: '严谨治学',
      description: '干练客观，侧重评价学习态度和思维能力，直击要害。',
      tooltip: '干练客观，侧重评价学习态度和思维能力，直击要害。'
    }
  ]
}

// 系统默认标签配置（可通过配置文件修改）
const defaultTagsConfig = {
  kindergarten: ['活泼', '懂事', '乖巧', '开朗', '好学', '友善', '独立', '专注', '勇敢', '有礼貌'],
  primary: ['认真', '积极', '勤奋', '善良', '负责', '团结', '自律', '进步', '主动', '热心'],
  middle: ['自律', '踏实', '刻苦', '上进', '独立', '钻研', '坚持', '优秀', '诚实', '稳重']
}

// ========== 登录状态管理 ==========
const isActivated = ref(false) // 是否已激活
const activationCode = ref('') // 当前激活码

const schoolStage = ref<SchoolStage>('primary')
const wordCount = ref(100)
const rowCount = ref(1)
const globalStyle = ref<string>(styleConfigs.primary[0].value) // 全局风格，默认小学第一个
const sidebarCollapsed = ref(false) // 侧边栏收起状态
const settingsOpen = ref(true) // 设置面板展开状态

// 用户自定义标签（按学段存储）
const customTags = ref<Record<SchoolStage, string[]>>({
  kindergarten: [],
  primary: [],
  middle: []
})

// 标签管理弹窗状态
const tagManagementOpen = ref(false)
const tagManagementStage = ref<SchoolStage>('primary')

// 合并后的所有标签（系统默认 + 用户自定义）
const allTags = computed(() => ({
  kindergarten: [...defaultTagsConfig.kindergarten, ...customTags.value.kindergarten],
  primary: [...defaultTagsConfig.primary, ...customTags.value.primary],
  middle: [...defaultTagsConfig.middle, ...customTags.value.middle]
}))

// 按学段存储学生数据
const studentsData = ref<Record<SchoolStage, Student[]>>({
  kindergarten: [
    {
      id: Date.now() + 1000,
      name: '',
      gender: '男',
      tags: [],
      style: styleConfigs.kindergarten[0].value,
      comment: '等待生成...',
      isGenerating: false,
      isException: false,
      hasError: false
    }
  ],
  primary: [
    {
      id: 1,
      name: '小明',
      gender: '男',
      tags: ['活泼', '懂事'],
      style: styleConfigs.primary[0].value,
      comment: '小明是一个活泼开朗、乐于助人的孩子。在本学期中，他展现出了极强的学习热情和求知欲。他在课堂上积极发言，总是第一个举手回答问题。在与同学相处时，他表现得非常友善，经常帮助有困难的小朋友。希望小明继续保持这份热情，在新的学期里取得更大的进步！',
      isGenerating: false,
      isException: false,
      hasError: false
    },
    {
      id: 2,
      name: '小红',
      gender: '女',
      tags: ['乖巧'],
      style: styleConfigs.primary[0].value,
      comment: '等待生成...',
      isGenerating: false,
      isException: false,
      hasError: false
    },
    {
      id: 3,
      name: '',
      gender: '男',
      tags: [],
      style: styleConfigs.primary[0].value,
      comment: '等待生成...',
      isGenerating: false,
      isException: false,
      hasError: false
    }
  ],
  middle: [
    {
      id: Date.now() + 2000,
      name: '',
      gender: '男',
      tags: [],
      style: styleConfigs.middle[0].value,
      comment: '等待生成...',
      isGenerating: false,
      isException: false,
      hasError: false
    }
  ]
})

// 计算属性：获取当前学段的学生数据
const students = computed({
  get: () => studentsData.value[schoolStage.value],
  set: (value) => {
    studentsData.value[schoolStage.value] = value
  }
})

// 监听学段变化，更新全局风格为对应学段的第一个风格，并更新当前学段所有非例外学生的风格
watch(schoolStage, (newStage) => {
  const newGlobalStyle = styleConfigs[newStage][0].value
  globalStyle.value = newGlobalStyle
  // 更新当前学段所有非例外学生的风格
  studentsData.value[newStage] = studentsData.value[newStage].map(student => {
    if (!student.isException) {
      return { ...student, style: newGlobalStyle }
    }
    return student
  })
})

// Toast 通知状态
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')

// 显示 Toast 通知
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const quota = ref(0) // 剩余额度（将从服务器同步）

// ========== 初始化和登录相关函数 ==========

// 页面加载时检查登录状态
onMounted(() => {
  const activation = getActivation()
  if (activation) {
    isActivated.value = true
    activationCode.value = activation.activationCode
    quota.value = activation.remainingQuota

    // 异步同步服务器额度
    syncQuotaFromServer()
  }
})

// 从服务器同步额度
const syncQuotaFromServer = async () => {
  const code = getActivationCode()
  if (!code) return

  try {
    const result = await checkQuota(code)
    quota.value = result.remainingQuota
    updateLocalQuota(result.remainingQuota)
  } catch (error) {
    console.error('同步额度失败:', error)
  }
}

// 处理激活成功
const handleActivated = (remainingQuota: number) => {
  const activation = getActivation()
  if (activation) {
    isActivated.value = true
    activationCode.value = activation.activationCode
    quota.value = remainingQuota
    showToast(`激活成功！剩余额度：${remainingQuota} 次`, 'success')
  }
}

// 退出登录
const handleLogout = () => {
  clearActivation()
  isActivated.value = false
  activationCode.value = ''
  quota.value = 0
  showToast('已退出登录', 'info')
}

// 计算当前学段的可用风格
const availableStyles = computed(() => styleConfigs[schoolStage.value])

// 全局风格变化时更新所有非例外学生的风格
const updateGlobalStyle = (event: Event) => {
  const newStyle = (event.target as HTMLSelectElement).value
  globalStyle.value = newStyle
  students.value = students.value.map(student => {
    if (!student.isException) {
      return { ...student, style: newStyle }
    }
    return student
  })
}

// 单独设置学生风格（例外）
const setStudentStyle = (student: Student, style: string) => {
  student.style = style
  student.isException = true // 标记为例外
}

const addRows = () => {
  const count = parseInt(rowCount.value.toString())
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      students.value.push({
        id: Date.now() + i,
        name: '',
        gender: '男',
        tags: [],
        style: globalStyle.value, // 默认使用全局风格
        comment: '等待生成...',
        isGenerating: false,
        isException: false,
        hasError: false
      })
    }
  }
}

const reduceRows = () => {
  const count = parseInt(rowCount.value.toString())
  if (count > 0 && students.value.length > count) {
    students.value = students.value.slice(0, -count)
  }
}

const clearAll = () => {
  students.value = [{
    id: Date.now(),
    name: '',
    gender: '男',
    tags: [],
    style: globalStyle.value,
    comment: '等待生成...',
    isGenerating: false,
    isException: false,
    hasError: false
  }]
}

// 验证学生信息是否完整（姓名 + 性别 + 至少1个标签）
const validateStudent = (student: Student): boolean => {
  return !!(student.name && student.gender && student.tags.length > 0)
}

const generateSingleComment = async (student: Student) => {
  // 验证信息是否完整
  if (!validateStudent(student)) {
    const missing = []
    if (!student.name) missing.push('姓名')
    if (!student.gender) missing.push('性别')
    if (student.tags.length === 0) missing.push('标签')

    showToast(`信息不足，请补充：${missing.join('、')}`, 'error')
    student.hasError = true
    return
  }

  // 检查额度是否足够
  if (quota.value <= 0) {
    showToast('剩余额度不足，无法生成评语', 'error')
    return
  }

  // 检查是否已登录
  const code = activationCode.value
  if (!code) {
    showToast('请先登录', 'error')
    return
  }

  student.hasError = false
  student.isGenerating = true

  try {
    // 构建提示词
    const genderText = student.gender === '男' ? '他' : '她'
    const template = allPrompts[student.style] || defaultPrompt
    const prompt = renderPrompt(template, {
      name: student.name,
      tags: student.tags.join('、'),
      gender: genderText
    })

    // 调用真实 API 生成评语
    const result = await generateComment({
      code: code,
      prompt: prompt,
      studentInfo: {
        name: student.name,
        gender: student.gender,
        tags: student.tags
      }
    })

    if (result.success) {
      student.comment = result.comment
      quota.value = result.remainingQuota
      updateLocalQuota(result.remainingQuota)
      showToast(`评语生成成功，剩余额度：${quota.value} 次`, 'success')
    } else {
      throw new Error(result.error || '生成失败')
    }
  } catch (error) {
    // 生成失败，不扣除额度
    const errorMsg = error instanceof Error ? error.message : '评语生成失败'
    showToast(errorMsg, 'error')
    student.hasError = true
    student.comment = '生成失败，请重试'
  } finally {
    student.isGenerating = false
  }
}

const getStyleDescription = (style: string): string => {
  const configs = Object.values(styleConfigs).flat()
  const config = configs.find(s => s.value === style)
  return config ? config.description : ''
}

const generateAllComments = async () => {
  // 只处理有姓名的学生
  const studentsToCheck = students.value.filter(student => student.name)

  if (studentsToCheck.length === 0) {
    showToast('请先填写学生姓名', 'error')
    return
  }

  // 验证每个学生的信息
  const validStudents = studentsToCheck.filter(student => validateStudent(student))
  const invalidStudents = studentsToCheck.filter(student => !validateStudent(student))

  // 标记信息不足的学生
  invalidStudents.forEach(student => {
    student.hasError = true
    student.comment = '信息不足，无法生成'
  })

  if (validStudents.length === 0) {
    showToast('没有符合条件的学生，请补充信息（需要：姓名、性别、至少1个标签）', 'error')
    return
  }

  // 检查额度是否足够
  if (quota.value < validStudents.length) {
    showToast(`额度不足！需要 ${validStudents.length} 次，当前剩余 ${quota.value} 次`, 'error')
    return
  }

  // 检查是否已登录
  const code = activationCode.value
  if (!code) {
    showToast('请先登录', 'error')
    return
  }

  showToast(`开始生成 ${validStudents.length} 条评语${invalidStudents.length > 0 ? `，跳过 ${invalidStudents.length} 条信息不足的记录` : ''}`, 'info')

  // 创建请求队列
  const queue = new RequestQueue(800) // 每个请求间隔800ms

  // 添加所有任务到队列
  validStudents.forEach(student => {
    queue.addTask({
      id: student.id,
      execute: async () => {
        student.hasError = false
        student.isGenerating = true

        try {
          // 构建提示词
          const genderText = student.gender === '男' ? '他' : '她'
          const template = allPrompts[student.style] || defaultPrompt
          const prompt = renderPrompt(template, {
            name: student.name,
            tags: student.tags.join('、'),
            gender: genderText
          })

          // 调用 API
          const result = await generateComment({
            code: code,
            prompt: prompt,
            studentInfo: {
              name: student.name,
              gender: student.gender,
              tags: student.tags
            }
          })

          if (result.success) {
            student.comment = result.comment
            quota.value = result.remainingQuota
            updateLocalQuota(result.remainingQuota)
            return { success: true, studentName: student.name }
          } else {
            throw new Error(result.error || '生成失败')
          }
        } catch (error) {
          student.hasError = true
          student.comment = '生成失败，请重试'
          throw error
        } finally {
          student.isGenerating = false
        }
      }
    })
  })

  // 进度回调
  queue.onProgress = (current, total) => {
    console.log(`批量生成进度: ${current}/${total}`)
  }

  // 完成回调
  queue.onComplete = (results, errors) => {
    const successCount = results.size
    const failCount = errors.size

    showToast(
      `评语生成完成！成功 ${successCount} 条${failCount > 0 ? `，失败 ${failCount} 条` : ''}，剩余额度：${quota.value} 次`,
      successCount > 0 ? 'success' : 'error'
    )
  }

  // 开始执行队列
  await queue.start()
}

const importExcel = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        students.value = jsonData.map((row: any, index) => ({
          id: Date.now() + index,
          name: row['姓名'] || '',
          gender: row['性别'] || '',
          tags: row['表现/性格标签'] ? row['表现/性格标签'].split(',') : [],
          style: globalStyle.value,
          comment: row['评语内容'] || '等待生成...',
          isGenerating: false,
          isException: false,
          hasError: false
        }))

        showToast(`成功导入 ${jsonData.length} 条学生信息`, 'success')
      }
      reader.readAsArrayBuffer(file)
    }
  }
  input.click()
}

const exportExcel = () => {
  const data = students.value.map(s => ({
    '姓名': s.name,
    '性别': s.gender,
    '表现/性格标签': s.tags.join(','),
    '评语风格': availableStyles.value.find(style => style.value === s.style)?.label || s.style,
    '评语内容': s.comment
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '学生评语')
  XLSX.writeFile(wb, '学生评语.xlsx')

  showToast('成功导出 Excel 文件', 'success')
}

const printPreview = () => {
  window.print()
}

const removeStudent = (id: number) => {
  students.value = students.value.filter(s => s.id !== id)
}

// 标签输入状态管理
const tagInputs = ref<Record<number, string>>({})
const tagDropdownOpen = ref<Record<number, boolean>>({})
const tagSearchQuery = ref<Record<number, string>>({})
const newTagInput = ref('')
const editingTag = ref<{ stage: SchoolStage; index: number; value: string } | null>(null)

const removeTag = (student: Student, tag: string) => {
  student.tags = student.tags.filter(t => t !== tag)
}

const addTag = (student: Student, tag: string) => {
  if (tag && !student.tags.includes(tag)) {
    student.tags.push(tag)
  }
}

// 切换标签下拉菜单
const toggleTagDropdown = (studentId: number) => {
  tagDropdownOpen.value[studentId] = !tagDropdownOpen.value[studentId]
  if (tagDropdownOpen.value[studentId]) {
    tagSearchQuery.value[studentId] = ''
  }
}

// 从下拉菜单添加标签
const addTagFromDropdown = (student: Student, tag: string) => {
  if (!student.tags.includes(tag)) {
    student.tags.push(tag)
  }
}

// 从输入框添加新标签
const addNewTagFromSearch = (student: Student) => {
  const query = tagSearchQuery.value[student.id]?.trim()

  if (!query) return

  if (query.length > 30) {
    showToast('标签长度不能超过30个字符', 'error')
    return
  }

  if (!student.tags.includes(query)) {
    student.tags.push(query)
    tagSearchQuery.value[student.id] = ''

    // 如果是新标签，同步到自定义标签列表
    const currentStageTags = allTags.value[schoolStage.value]
    if (!currentStageTags.includes(query)) {
      customTags.value[schoolStage.value].push(query)
    }
  }
}

// 过滤可用标签（基于搜索）
const getFilteredTags = (studentId: number) => {
  const currentStageTags = allTags.value[schoolStage.value]
  const query = tagSearchQuery.value[studentId]?.toLowerCase() || ''

  if (!query) return currentStageTags

  return currentStageTags.filter(tag => tag.toLowerCase().includes(query))
}

const handleTagInputKeydown = (event: KeyboardEvent, student: Student) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const inputValue = tagInputs.value[student.id]?.trim()
    if (inputValue && !student.tags.includes(inputValue)) {
      // 限制标签长度在30个字符以内
      if (inputValue.length > 30) {
        showToast('标签长度不能超过30个字符', 'error')
        return
      }

      student.tags.push(inputValue)
      tagInputs.value[student.id] = ''

      // 如果是新标签，同步到自定义标签列表
      const currentStageTags = allTags.value[schoolStage.value]
      if (!currentStageTags.includes(inputValue)) {
        customTags.value[schoolStage.value].push(inputValue)
      }
    }
  }
}

// 标签管理功能
const openTagManagement = () => {
  tagManagementStage.value = schoolStage.value
  tagManagementOpen.value = true
}

const addCustomTag = () => {
  const trimmedTag = newTagInput.value.trim()

  if (!trimmedTag) {
    showToast('请输入标签内容', 'error')
    return
  }

  if (trimmedTag.length > 30) {
    showToast('标签长度不能超过30个字符', 'error')
    return
  }

  const currentStageTags = allTags.value[tagManagementStage.value]

  if (currentStageTags.includes(trimmedTag)) {
    showToast('该标签已存在', 'error')
    return
  }

  customTags.value[tagManagementStage.value].push(trimmedTag)
  newTagInput.value = ''
  showToast('标签添加成功', 'success')
}

const removeCustomTag = (stage: SchoolStage, tag: string) => {
  // 只能删除自定义标签，不能删除系统默认标签
  if (defaultTagsConfig[stage].includes(tag)) {
    showToast('系统默认标签不能删除', 'error')
    return
  }

  customTags.value[stage] = customTags.value[stage].filter(t => t !== tag)
  showToast('标签删除成功', 'success')
}

const startEditTag = (stage: SchoolStage, index: number, tag: string) => {
  // 只能编辑自定义标签
  if (defaultTagsConfig[stage].includes(tag)) {
    showToast('系统默认标签不能编辑', 'error')
    return
  }

  editingTag.value = { stage, index, value: tag }
}

const saveEditTag = () => {
  if (!editingTag.value) return

  const { stage, index, value } = editingTag.value
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    showToast('标签内容不能为空', 'error')
    return
  }

  if (trimmedValue.length > 30) {
    showToast('标签长度不能超过30个字符', 'error')
    return
  }

  // 检查是否与其他标签重复
  const currentStageTags = allTags.value[stage]
  const customIndex = index - defaultTagsConfig[stage].length

  if (currentStageTags.includes(trimmedValue) && customTags.value[stage][customIndex] !== trimmedValue) {
    showToast('该标签已存在', 'error')
    return
  }

  customTags.value[stage][customIndex] = trimmedValue
  editingTag.value = null
  showToast('标签编辑成功', 'success')
}

const cancelEditTag = () => {
  editingTag.value = null
}

const clearCustomTags = (stage: SchoolStage) => {
  if (customTags.value[stage].length === 0) {
    showToast('当前学段没有自定义标签', 'info')
    return
  }

  if (confirm(`确定要清空${stage === 'kindergarten' ? '幼儿园' : stage === 'primary' ? '小学' : '初中'}的所有自定义标签吗？`)) {
    customTags.value[stage] = []
    showToast('自定义标签已清空', 'success')
  }
}
</script>

<template>
  <LoginView v-if="!isActivated" @activated="handleActivated" />
  <div v-else class="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex overflow-hidden">
    <!-- 左侧边栏 (占满整个左侧高度) -->
    <div
      :class="[
        'bg-[#1e3a5f] border-r border-slate-600 flex flex-col transition-all duration-300 no-print shadow-sm overflow-y-auto',
        sidebarCollapsed ? 'w-16' : 'w-56'
      ]"
    >
      <!-- 侧边栏顶部标题 -->
      <div class="p-4 border-b border-slate-600/80 bg-[#2a4a6f]/50">
        <div v-if="!sidebarCollapsed" class="flex items-center gap-3">
          <div class="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-md">
            <span class="text-white text-lg">📝</span>
          </div>
          <h1 class="text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">智能评语系统</h1>
        </div>
        <div v-else class="flex items-center justify-center">
          <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-md">
            <span class="text-white text-base">📝</span>
          </div>
        </div>
      </div>

      <!-- 额度显示 (在侧边栏内) -->
      <div v-if="!sidebarCollapsed" class="px-4 py-3 border-b border-slate-600/50">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30 shadow-sm transition-all duration-200">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
          </span>
          <span class="text-slate-200 text-xs font-medium">剩余额度</span>
          <span class="font-bold text-green-400 text-sm">{{ quota }}</span>
          <span class="text-slate-300 text-xs">次</span>
        </div>

        <!-- 退出登录按钮 -->
        <button
          @click="handleLogout"
          class="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-lg border border-red-400/30 transition-all duration-200 text-xs"
        >
          <LogOut :size="14" />
          <span>退出登录</span>
        </button>
      </div>

      <!-- 侧边栏切换按钮 -->
      <div class="p-4 border-b border-slate-600/80 bg-[#2a4a6f]/50">
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="flex items-center justify-center w-full text-sm text-slate-200 hover:text-white hover:bg-[#3b5a80] rounded-lg py-2 transition-all duration-200 hover:scale-105"
        >
          {{ sidebarCollapsed ? '→' : '←' }}
          <span v-if="!sidebarCollapsed" class="ml-2">收起</span>
        </button>
      </div>

      <!-- 学段选择 -->
      <div class="py-3 px-3">
        <div v-if="!sidebarCollapsed" class="px-3 py-2 text-xs text-slate-400 font-semibold tracking-wider uppercase">学段</div>
        <div class="space-y-1">
          <button
            v-for="stage in [
              { value: 'kindergarten', label: '幼儿园', short: '幼', icon: '🎨' },
              { value: 'primary', label: '小学', short: '小', icon: '📚' },
              { value: 'middle', label: '初中', short: '中', icon: '🎓' }
            ]"
            :key="stage.value"
            @click="schoolStage = stage.value as SchoolStage"
            :class="[
              'w-full px-3 py-2.5 text-sm transition-all duration-200 flex items-center gap-3 rounded-lg relative overflow-hidden group',
              sidebarCollapsed ? 'justify-center' : '',
              schoolStage === stage.value
                ? 'bg-[#3b5a80] text-white font-semibold shadow-sm border-l-3 border-[#1e3a5f]'
                : 'bg-transparent text-slate-200 hover:bg-[#2d4a6f]'
            ]"
          >
            <span class="text-base">{{ stage.icon }}</span>
            <span v-if="!sidebarCollapsed">{{ stage.label }}</span>
            <span v-else class="sr-only">{{ stage.label }}</span>
          </button>
        </div>
      </div>

      <!-- 设置区域 (可折叠) -->
      <div v-if="!sidebarCollapsed" class="mt-4 border-t border-slate-600 pt-4 px-3">
        <div class="rounded-lg border border-slate-600 bg-[#2a4a6f]/50 shadow-sm overflow-hidden">
          <!-- 设置面板标题 -->
          <button
            @click="settingsOpen = !settingsOpen"
            class="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[#2a4a6f]/80 transition-all duration-200"
          >
            <span class="flex items-center gap-2">
              <Settings :size="16" class="text-slate-400" />
              设置
            </span>
            <span class="text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': settingsOpen }">
              <ChevronDown :size="16" />
            </span>
          </button>

          <!-- 设置面板内容 (可折叠) -->
          <div v-show="settingsOpen" class="border-t border-slate-600 px-3 py-3 space-y-3">
            <!-- 评语字数 -->
            <div class="space-y-1">
              <label class="block text-xs text-slate-300">评语字数 (最大300)</label>
              <input
                v-model="wordCount"
                type="number"
                min="50"
                max="300"
                class="w-full h-10 px-3 py-2 text-sm border border-slate-500 bg-[#2a4a6f] text-slate-100 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            <!-- 行数操作 -->
            <div class="space-y-1">
              <label class="block text-xs text-slate-300">行数操作</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="rowCount"
                  type="number"
                  min="1"
                  max="50"
                  class="h-10 w-16 px-2 py-2 text-sm border border-slate-500 bg-[#2a4a6f] text-slate-100 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
                <span class="text-xs text-slate-300">行</span>
              </div>
              <!-- ButtonGroup style -->
              <div class="flex">
                <button
                  @click="addRows"
                  class="flex-1 h-10 px-3 py-2 text-xs bg-[#2a4a6f] text-slate-200 border border-slate-500 border-r-0 first:rounded-l-lg last:rounded-r-lg hover:bg-[#355b87] transition-colors"
                >
                  增加
                </button>
                <button
                  @click="reduceRows"
                  class="flex-1 h-10 px-3 py-2 text-xs bg-[#2a4a6f] text-slate-200 border border-slate-500 first:rounded-l-lg last:rounded-r-lg hover:bg-[#355b87] transition-colors"
                >
                  减少
                </button>
              </div>
            </div>

            <!-- 一键清空 -->
            <div class="pt-2 border-t border-slate-600">
              <button
                @click="clearAll"
                class="w-full h-10 px-3 py-2 text-xs text-red-400 bg-transparent border border-red-400/60 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 :size="12" />
                一键清空
              </button>
            </div>

            <!-- 标签管理 -->
            <div class="pt-2 border-t border-slate-600">
              <button
                @click="openTagManagement"
                class="w-full h-10 px-3 py-2 text-xs text-white bg-[#1e3a5f] border border-[#1e3a5f] rounded-lg hover:bg-[#2d4a6f] transition-colors flex items-center justify-center gap-1.5"
              >
                <Settings :size="12" />
                标签管理
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 收起状态下的设置图标 -->
      <div v-if="sidebarCollapsed" class="mt-auto p-2">
        <button class="w-full p-2 text-slate-300 hover:text-white rounded transition-colors">
          ⚙️
        </button>
      </div>
    </div>

    <!-- 右侧主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-[#f1f5f9]">
      <!-- 表格区域 -->
      <div class="flex-1 overflow-hidden pb-14 p-4">
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm h-full flex flex-col">
          <!-- 表格标题栏 -->
          <div class="px-3 py-3 border-b border-slate-200 bg-[#f8fafc] flex items-center gap-2">
            <span class="text-xs text-[#1e293b] font-medium">全局风格：</span>
            <select
              v-model="globalStyle"
              @change="updateGlobalStyle"
              class="px-3 py-1 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option
                v-for="style in availableStyles"
                :key="style.value"
                :value="style.value"
              >
                {{ style.label }}
              </option>
            </select>
            <Tooltip :content="availableStyles.find(s => s.value === globalStyle)?.description" position="right">
              <button class="ml-1 text-xs text-[#1e3a5f] hover:text-[#2d4a6f]">
                <span class="inline-block w-3.5 h-3.5 text-center rounded-full bg-[#e8eef5] text-[#1e3a5f]">ⓘ</span>
              </button>
            </Tooltip>
            <span class="ml-auto text-xs text-[#64748b]">共 <span class="font-medium text-[#1e293b]">{{ students.length }}</span> 条数据</span>
          </div>

          <!-- 表格卡片列表 -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <!-- 固定表头区域 -->
            <div class="bg-white border-b border-slate-200 px-4 py-3">
              <div class="grid grid-cols-[10%_8%_18%_12%_10%_42%] gap-2 text-sm text-[#64748b] font-medium">
                <div>姓名</div>
                <div>性别</div>
                <div>表现/性格标签</div>
                <div>
                  <div class="flex items-center gap-1">
                    评语风格
                    <Tooltip content="单独设置后不受全局影响">
                      <button class="text-[#1e3a5f]">
                        <Info :size="12" class="h-3 w-3" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <div>操作</div>
                <div>评语内容</div>
              </div>
            </div>

            <!-- 可滚动内容区域 -->
            <div class="flex-1 overflow-auto p-4">
              <!-- 学生卡片列表 -->
              <div class="space-y-3">
                <div
                  v-for="(student, index) in students"
                  :key="student.id"
                  class="grid grid-cols-[10%_8%_18%_12%_10%_42%] gap-2 items-start bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <!-- 姓名 -->
                  <div>
                    <input
                      v-model="student.name"
                      type="text"
                      placeholder=" "
                      class="w-full h-10 px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 bg-white"
                    />
                  </div>

                  <!-- 性别 -->
                  <div>
                    <select
                      v-model="student.gender"
                      class="w-full h-10 px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 bg-white"
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>

                  <!-- 标签 -->
                  <div>
                    <div class="relative min-w-[120px]">
                      <!-- 已选标签 -->
                      <div class="flex flex-wrap gap-1 mb-1">
                        <span
                          v-for="tag in student.tags"
                          :key="tag"
                          class="inline-flex items-center gap-0.5 px-3 py-1 bg-[#e8eef5] text-[#1e3a5f] text-xs rounded-full hover:bg-[#d0dce9] transition-colors"
                        >
                          {{ tag }}
                          <button
                            @click="removeTag(student, tag)"
                            class="ml-0.5 rounded-full hover:bg-[#1e3a5f]/20 hover:text-red-500 transition-colors"
                            title="删除标签"
                          >
                            <X :size="10" class="h-2.5 w-2.5" />
                          </button>
                        </span>
                      </div>

                      <!-- 添加标签按钮 -->
                      <button
                        @click="toggleTagDropdown(student.id)"
                        class="text-xs text-[#1e3a5f] hover:text-[#2d4a6f] flex items-center gap-1"
                        ref="tagButton"
                      >
                        <Plus :size="12" />
                        <span>添加标签</span>
                      </button>

                      <!-- 下拉菜单 - 使用 Teleport 传送到 body -->
                      <Teleport to="body">
                        <div
                          v-if="tagDropdownOpen[student.id]"
                          class="fixed w-64 bg-white border border-[#e2e8f0] rounded-lg shadow-lg z-[1000] max-h-64 overflow-hidden flex flex-col"
                          :style="{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }"
                        >
                        <!-- 搜索框 -->
                        <div class="p-2 border-b border-[#e2e8f0]">
                          <input
                            v-model="tagSearchQuery[student.id]"
                            @keydown.enter="addNewTagFromSearch(student)"
                            placeholder="搜索或输入新标签，回车创建"
                            class="w-full h-10 px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                            autofocus
                          />
                        </div>

                        <!-- 标签列表 -->
                        <div class="flex-1 overflow-auto p-2">
                          <!-- 系统默认标签 -->
                          <div class="mb-2">
                            <div class="text-xs text-[#64748b] mb-1 px-1">系统默认</div>
                            <div class="flex flex-wrap gap-2">
                              <button
                                v-for="tag in getFilteredTags(student.id).filter(t => defaultTagsConfig[schoolStage].includes(t) && !student.tags.includes(t))"
                                :key="tag"
                                @click="addTagFromDropdown(student, tag)"
                                class="px-3 py-1 bg-[#f1f5f9] text-[#1e293b] text-xs rounded-full hover:bg-[#e2e8f0] transition-colors"
                              >
                                {{ tag }}
                              </button>
                            </div>
                          </div>

                          <!-- 自定义标签 -->
                          <div v-if="customTags[schoolStage].filter(t => !student.tags.includes(t)).length > 0" class="pt-2 border-t border-[#e2e8f0]">
                            <div class="text-xs text-[#64748b] mb-1 px-1">自定义</div>
                            <div class="flex flex-wrap gap-2">
                              <button
                                v-for="tag in getFilteredTags(student.id).filter(t => customTags[schoolStage].includes(t) && !student.tags.includes(t))"
                                :key="tag"
                                @click="addTagFromDropdown(student, tag)"
                                class="px-3 py-1 bg-[#e8eef5] text-[#1e3a5f] text-xs rounded-full hover:bg-[#d0dce9] transition-colors"
                              >
                                {{ tag }}
                              </button>
                            </div>
                          </div>

                          <!-- 无结果提示 -->
                          <div
                            v-if="tagSearchQuery[student.id] && getFilteredTags(student.id).filter(t => !student.tags.includes(t)).length === 0"
                            class="text-xs text-[#94a3b8] text-center py-2"
                          >
                            未找到匹配标签，回车创建新标签
                          </div>
                        </div>

                        <!-- 底部提示 -->
                        <div class="p-2 border-t border-[#e2e8f0] bg-[#f8fafc] text-xs text-[#64748b]">
                          提示：输入新标签后按回车创建
                        </div>
                      </div>

                      <!-- 点击外部关闭下拉菜单 - 遮罩层 -->
                      <div
                        v-if="tagDropdownOpen[student.id]"
                        @click="tagDropdownOpen[student.id] = false"
                        class="fixed inset-0 z-[999]"
                      ></div>
                    </Teleport>
                    </div>
                  </div>

                  <!-- 评语风格 -->
                  <div>
                    <div class="flex items-center gap-1">
                      <select
                        v-model="student.style"
                        @change="setStudentStyle(student, student.style)"
                        class="h-10 px-3 py-2 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 bg-white"
                      >
                        <option
                          v-for="style in availableStyles"
                          :key="style.value"
                          :value="style.value"
                        >
                          {{ style.label }}
                        </option>
                      </select>
                      <!-- 风格说明 -->
                      <Tooltip :content="availableStyles.find(s => s.value === student.style)?.description" position="top">
                        <button class="text-[#1e3a5f]">
                          <Info :size="12" class="h-3 w-3" />
                        </button>
                      </Tooltip>
                      <!-- 例外标识 -->
                      <span
                        v-if="student.isException"
                        class="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e8eef5] text-[#1e3a5f] text-xs rounded-full"
                      >
                        例外
                      </span>
                    </div>
                  </div>

                  <!-- 操作 -->
                  <div>
                    <div class="flex items-center gap-1">
                      <!-- 已生成评语：显示重写按钮 (深蓝色) -->
                      <button
                        v-if="student.comment && student.comment !== '等待生成...'"
                        @click="generateSingleComment(student)"
                        :disabled="student.isGenerating"
                        class="px-2 py-1 bg-[#1e3a5f] text-white text-xs rounded-lg hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 h-8 whitespace-nowrap shadow-sm"
                        title="重新生成评语"
                      >
                        <RefreshCw :size="12" :class="{ 'animate-spin': student.isGenerating }" />
                        <span>重写</span>
                      </button>
                      <!-- 未生成评语：显示生成按钮 (深蓝色) -->
                      <button
                        v-else
                        @click="generateSingleComment(student)"
                        :disabled="student.isGenerating || !student.name"
                        class="px-2 py-1 bg-[#1e3a5f] text-white text-xs rounded-lg hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 h-8 whitespace-nowrap shadow-sm"
                        title="生成评语"
                      >
                        <Sparkles :size="12" :class="{ 'animate-pulse': student.isGenerating }" />
                        <span>生成</span>
                      </button>
                      <button
                        @click="removeStudent(student.id)"
                        class="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex items-center justify-center h-8 w-8"
                        title="删除学生"
                      >
                        <Trash2 :size="12" />
                      </button>
                    </div>
                  </div>

                  <!-- 评语内容 -->
                  <div>
                    <div class="w-full">
                      <div
                        v-if="student.comment === '等待生成...'"
                        class="border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] rounded-lg p-4 text-[#94a3b8] text-center min-h-[100px] flex items-center justify-center"
                      >
                        等待生成...
                      </div>
                      <div
                        v-else-if="student.hasError"
                        class="bg-red-50 border border-red-500 rounded-lg p-4 text-sm text-red-600 min-h-[100px] flex items-center justify-center"
                      >
                        {{ student.comment }}
                      </div>
                      <div
                        v-else
                        class="bg-[#e8eef5] rounded-lg p-4 text-sm border border-[#1e3a5f]/20 min-h-[100px]"
                      >
                        <textarea
                          v-model="student.comment"
                          rows="4"
                          class="w-full min-h-[100px] px-3 py-2 text-sm border-0 bg-transparent rounded focus:outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

      </div>

    <!-- 底部固定工具栏 (Fixed) -->
    <div class="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e2e8f0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 no-print">
      <div class="flex h-16 items-center justify-end px-6 py-4 gap-3">
        <!-- Right: Actions -->
        <button
          @click="importExcel"
          class="flex items-center gap-2 px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors h-9 bg-white"
        >
          <FileDown :size="16" />
          导入 Excel
        </button>
        <button
          @click="exportExcel"
          class="flex items-center gap-2 px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors h-9 bg-white"
        >
          <FileUp :size="16" />
          导出 Excel
        </button>
        <button
          @click="printPreview"
          class="flex items-center gap-2 px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors h-9 bg-white"
        >
          <Printer :size="16" />
          打印预览
        </button>
        <button
          @click="generateAllComments"
          class="flex items-center gap-2 px-6 py-2 bg-[#1e3a5f] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a6f] transition-all duration-200 shadow-md h-10 whitespace-nowrap"
        >
          <span class="text-base">✨</span>
          一键生成所有评语
        </button>
      </div>
    </div>

    <Toast :message="toastMessage" :type="toastType" />

    <!-- 标签管理弹窗 -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="tagManagementOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="tagManagementOpen = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
            <!-- 弹窗标题 -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 class="text-lg font-semibold text-[#1e293b]">标签管理</h2>
              <button
                @click="tagManagementOpen = false"
                class="text-[#64748b] hover:text-[#1e293b] transition-all duration-200 hover:rotate-90"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- 学段切换 (分段控制器样式) -->
            <div class="px-6 py-4 border-b border-[#e2e8f0]">
              <div class="inline-flex bg-[#f1f5f9] rounded-lg p-1 gap-1">
                <button
                  v-for="stage in [
                    { value: 'kindergarten', label: '幼儿园' },
                    { value: 'primary', label: '小学' },
                    { value: 'middle', label: '初中' }
                  ]"
                  :key="stage.value"
                  @click="tagManagementStage = stage.value as SchoolStage"
                  :class="[
                    'px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium',
                    tagManagementStage === stage.value
                      ? 'bg-white text-[#1e293b] shadow-sm'
                      : 'bg-transparent text-[#64748b] hover:text-[#1e293b]'
                  ]"
                >
                  {{ stage.label }}
                </button>
              </div>
            </div>

            <!-- 标签列表 -->
            <div class="flex-1 overflow-auto px-6 py-4">
              <div class="space-y-6">
                <!-- 系统默认标签 -->
                <div class="pb-4 border-b border-[#e2e8f0]">
                  <h3 class="text-sm font-medium text-[#1e293b] mb-3 flex items-center gap-2">
                    <span>系统默认标签</span>
                    <span class="text-xs text-[#64748b]">(不可删除)</span>
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in defaultTagsConfig[tagManagementStage]"
                      :key="tag"
                      class="inline-flex items-center px-3 py-1 bg-[#f1f5f9] text-[#1e293b] text-sm rounded-full"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- 用户自定义标签 -->
                <div>
                  <h3 class="text-sm font-medium text-[#1e293b] mb-3 flex items-center gap-2">
                    <span>自定义标签</span>
                    <span class="text-xs text-[#64748b]">({{ customTags[tagManagementStage].length }}个)</span>
                  </h3>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <template v-if="customTags[tagManagementStage].length > 0">
                      <span
                        v-for="(tag, index) in customTags[tagManagementStage]"
                        :key="index"
                        class="inline-flex items-center gap-1 px-3 py-1 bg-[#e8eef5] text-[#1e3a5f] text-sm rounded-full hover:bg-[#d0dce9] transition-colors group"
                      >
                        <template v-if="editingTag && editingTag.stage === tagManagementStage && editingTag.index === defaultTagsConfig[tagManagementStage].length + index">
                          <input
                            v-model="editingTag.value"
                            @keydown.enter="saveEditTag"
                            @keydown.esc="cancelEditTag"
                            class="w-20 px-1 bg-white border border-[#1e3a5f] rounded text-sm focus:outline-none"
                            autofocus
                          />
                          <button @click="saveEditTag" class="text-green-600 hover:text-green-700">
                            ✓
                          </button>
                          <button @click="cancelEditTag" class="text-red-600 hover:text-red-700">
                            ✗
                          </button>
                        </template>
                        <template v-else>
                          <span @dblclick="startEditTag(tagManagementStage, defaultTagsConfig[tagManagementStage].length + index, tag)">{{ tag }}</span>
                          <button
                            @click="removeCustomTag(tagManagementStage, tag)"
                            class="opacity-0 group-hover:opacity-100 transition-opacity"
                            title="删除标签"
                          >
                            <X :size="14" />
                          </button>
                        </template>
                      </span>
                    </template>
                    <span v-else class="text-sm text-[#94a3b8]">暂无自定义标签</span>
                  </div>

                  <!-- 添加新标签 -->
                  <div class="flex gap-2">
                    <input
                      v-model="newTagInput"
                      @keydown.enter="addCustomTag"
                      placeholder="输入新标签,回车添加（最多30字）"
                      class="flex-1 h-8 px-3 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    />
                    <button
                      @click="addCustomTag"
                      class="px-4 py-1 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#2d4a6f] transition-colors h-8"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-3">
              <button
                @click="clearCustomTags(tagManagementStage)"
                class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200"
              >
                清空自定义标签
              </button>
              <button
                @click="tagManagementOpen = false"
                class="px-6 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#2d4a6f] transition-all duration-200 shadow-sm"
              >
                完成
              </button>
            </div>
          </div>
        </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 打印样式 */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    background: white !important;
  }

  .min-h-screen {
    min-height: 0 !important;
  }

  .flex {
    display: block !important;
  }

  .flex-1 {
    flex: none !important;
  }

  .p-6 {
    padding: 0 !important;
  }

  .shadow-sm {
    box-shadow: none !important;
  }

  .border {
    border-color: #000 !important;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    border: 1px solid #000 !important;
    padding: 8px !important;
    text-align: left !important;
  }

  th {
    background-color: #f0f0f0 !important;
  }

  textarea {
    border: none !important;
    resize: none !important;
    background: transparent !important;
  }

  input, select {
    border: none !important;
    background: transparent !important;
  }

  button {
    display: none !important;
  }
}
</style>
