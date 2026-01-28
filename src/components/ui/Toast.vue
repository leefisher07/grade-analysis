<script setup lang="ts">
import { ref, watch } from 'vue'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 3000
})

const isVisible = ref(false)

const show = () => {
  isVisible.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      hide()
    }, props.duration)
  }
}

const hide = () => {
  isVisible.value = false
}

// 监听message变化，自动显示
watch(() => props.message, (newVal) => {
  if (newVal) {
    show()
  }
})

const getTypeClasses = () => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'info':
    default:
      return 'bg-sky-500 text-white'
  }
}
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed bottom-4 right-4 z-50"
  >
    <div
      :class="[
        'px-4 py-3 rounded-lg shadow-lg flex items-center gap-3',
        getTypeClasses()
      ]"
    >
      <span class="text-sm font-medium">{{ message }}</span>
      <button
        @click="hide"
        class="ml-2 text-white hover:opacity-80"
      >
        ×
      </button>
    </div>
  </div>
</template>