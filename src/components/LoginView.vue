<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center p-6">
    <!-- 登录卡片 -->
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200">
      <!-- Logo和标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
          <Sparkles :size="32" class="text-sky-600" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-2">智能评语系统</h1>
        <p class="text-slate-500 text-sm">请输入激活码以开始使用</p>
      </div>

      <!-- 激活码输入区域 -->
      <div class="space-y-4">
        <!-- 激活码输入框 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            激活码
          </label>
          <input
            v-model="activationCode"
            type="text"
            placeholder="请输入8位激活码"
            maxlength="8"
            :disabled="isActivating"
            @keyup.enter="handleActivate"
            class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none text-center text-xl tracking-widest font-mono transition-all"
            :class="{
              'bg-slate-50 cursor-not-allowed': isActivating,
              'border-red-300 focus:border-red-500 focus:ring-red-500/20': errorMessage
            }"
          />
          <!-- 错误提示 -->
          <p v-if="errorMessage" class="mt-2 text-sm text-red-600 flex items-center gap-1">
            <X :size="14" />
            {{ errorMessage }}
          </p>
        </div>

        <!-- 激活按钮 -->
        <button
          @click="handleActivate"
          :disabled="!canActivate || isActivating"
          class="w-full bg-sky-500 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          :class="{
            'opacity-50 cursor-not-allowed': !canActivate || isActivating,
            'hover:bg-sky-600 active:scale-98': canActivate && !isActivating
          }"
        >
          <template v-if="isActivating">
            <RefreshCw :size="20" class="animate-spin" />
            <span>正在激活...</span>
          </template>
          <template v-else>
            <Sparkles :size="20" />
            <span>激活系统</span>
          </template>
        </button>
      </div>

      <!-- 说明文字 -->
      <div class="mt-6 pt-6 border-t border-slate-200 space-y-2">
        <div class="flex items-start gap-2 text-sm text-slate-600">
          <Info :size="16" class="mt-0.5 flex-shrink-0 text-sky-600" />
          <p>激活码格式：8位字符（数字+字母+符号）</p>
        </div>
        <div class="flex items-start gap-2 text-sm text-slate-600">
          <Info :size="16" class="mt-0.5 flex-shrink-0 text-sky-600" />
          <p>每个激活码包含 500 次生成额度</p>
        </div>
        <div class="flex items-start gap-2 text-sm text-slate-600">
          <Info :size="16" class="mt-0.5 flex-shrink-0 text-sky-600" />
          <p>激活后可离线使用，额度云端同步</p>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="mt-6 text-center text-xs text-slate-400">
        版本 1.0.0 · 智能评语系统
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Info, X, RefreshCw } from 'lucide-vue-next'
import { verifyActivationCode } from '../utils/api'
import { saveActivation } from '../utils/activation'

// ========== Props ==========
const emit = defineEmits<{
  (e: 'activated', quota: number): void
}>()

// ========== 状态 ==========
const activationCode = ref('')
const isActivating = ref(false)
const errorMessage = ref('')

// ========== 计算属性 ==========
const canActivate = computed(() => {
  return activationCode.value.length === 8 && !isActivating.value
})

// ========== 方法 ==========
const handleActivate = async () => {
  if (!canActivate.value) return

  errorMessage.value = ''
  isActivating.value = true

  try {
    // 调用API验证激活码
    const result = await verifyActivationCode(activationCode.value.trim())

    if (!result.valid) {
      errorMessage.value = result.message || '激活码无效，请检查后重试'
      return
    }

    // 保存激活信息
    saveActivation({
      activationCode: activationCode.value.trim(),
      remainingQuota: result.remainingQuota || 500,
      activatedAt: result.activatedAt || new Date().toISOString(),
      lastUsedAt: new Date().toISOString()
    })

    // 触发激活成功事件
    emit('activated', result.remainingQuota || 500)

  } catch (error) {
    console.error('激活失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '激活失败，请检查网络连接'
  } finally {
    isActivating.value = false
  }
}
</script>

<style scoped>
.active\:scale-98:active {
  transform: scale(0.98);
}

/* 输入框动画 */
input:focus {
  animation: pulse-border 0.3s ease-in-out;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: rgb(14 165 233);
  }
  50% {
    border-color: rgb(56 189 248);
  }
}
</style>
