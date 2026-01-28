<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

interface TypewriterTextProps {
  text: string
  isGenerating?: boolean
}

const props = defineProps<TypewriterTextProps>()

const displayedText = ref('')
const showCursor = ref(false)
let intervalRef: number | null = null
let cursorIntervalRef: number | null = null

watch(() => [props.text, props.isGenerating], ([newText, isGenerating]) => {
  if (intervalRef) {
    clearInterval(intervalRef)
    intervalRef = null
  }
  if (cursorIntervalRef) {
    clearInterval(cursorIntervalRef)
    cursorIntervalRef = null
  }

  if (isGenerating && typeof newText === 'string') {
    displayedText.value = ''
    let i = 0
    intervalRef = window.setInterval(() => {
      if (i < newText.length) {
        displayedText.value = newText.slice(0, i + 1)
        i++
      } else {
        if (intervalRef) clearInterval(intervalRef)
      }
    }, 20)
  } else if (typeof newText === 'string') {
    displayedText.value = newText
  }

  if (isGenerating) {
    cursorIntervalRef = window.setInterval(() => {
      showCursor.value = !showCursor.value
    }, 500)
  } else {
    showCursor.value = false
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (intervalRef) clearInterval(intervalRef)
  if (cursorIntervalRef) clearInterval(cursorIntervalRef)
})
</script>

<template>
  <span class="text-sm leading-relaxed">
    <template v-if="displayedText">
      {{ displayedText }}
    </template>
    <template v-else>
      <span class="text-muted-foreground">等待生成...</span>
    </template>
    <span v-if="props.isGenerating && showCursor" class="animate-pulse">|</span>
  </span>
</template>