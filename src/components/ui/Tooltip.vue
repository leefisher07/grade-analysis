<script setup lang="ts">
import { ref } from 'vue'

interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  class?: string
}

const props = withDefaults(defineProps<TooltipProps>(), {
  position: 'top'
})

const isVisible = ref(false)
</script>

<template>
  <div class="relative inline-block" :class="props.class">
    <span
      @mouseenter="isVisible = true"
      @mouseleave="isVisible = false"
      class="cursor-help"
    >
      <slot></slot>
    </span>
    <div
      v-if="isVisible && props.content"
      :class="[
        'absolute z-50 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap',
        {
          'bottom-full left-1/2 transform -translate-x-1/2 mb-2': props.position === 'top',
          'top-full left-1/2 transform -translate-x-1/2 mt-2': props.position === 'bottom',
          'right-full top-1/2 transform -translate-y-1/2 mr-2': props.position === 'left',
          'left-full top-1/2 transform -translate-y-1/2 ml-2': props.position === 'right'
        }
      ]"
    >
      {{ props.content }}
      <div
        :class="[
          'absolute w-2 h-2 bg-gray-800 transform rotate-45',
          {
            'top-full left-1/2 transform -translate-x-1/2': props.position === 'top',
            'bottom-full left-1/2 transform -translate-x-1/2': props.position === 'bottom',
            'right-full top-1/2 transform -translate-y-1/2': props.position === 'left',
            'left-full top-1/2 transform -translate-y-1/2': props.position === 'right'
          }
        ]"
      ></div>
    </div>
  </div>
</template>