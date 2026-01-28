<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Info } from 'lucide-vue-next'
import { type SchoolStage, type StyleOption, stylesByStage } from '@/types'

interface StyleSelectorProps {
  value: string
  onChange: (value: string) => void
  stage: SchoolStage
  isCustom?: boolean
}

const props = defineProps<StyleSelectorProps>()
const emit = defineEmits(['update:modelValue'])

const styles = computed(() => stylesByStage[props.stage])
const open = ref(false)

const handleSelect = (value: string) => {
  props.onChange(value)
  open.value = false
}

const getCurrentLabel = () => {
  if (props.isCustom && props.value === 'inherit') {
    return '跟随全局'
  }
  const style = styles.value.find(s => s.value === props.value)
  return style?.label || '选择风格'
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :class="[
        'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.isCustom ? 'border-primary/50' : ''
      ]"
      @click="open = !open"
    >
      <span class="truncate">{{ getCurrentLabel() }}</span>
      <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
    </button>
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
      @click.outside="open = false"
    >
      <div class="py-1">
        <button
          v-if="props.isCustom"
          class="relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          :class="{ 'bg-accent text-accent-foreground': props.value === 'inherit' }"
          @click="handleSelect('inherit')"
        >
          跟随全局
        </button>
        <button
          v-for="style in styles"
          :key="style.value"
          class="relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          :class="{ 'bg-accent text-accent-foreground': props.value === style.value }"
          @click="handleSelect(style.value)"
        >
          <span>{{ style.label }}</span>
          <div class="ml-auto">
            <Info class="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>