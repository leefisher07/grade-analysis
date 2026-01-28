<script setup lang="ts">
import { ref, type HTMLAttributes } from 'vue'
import { ChevronDown, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface SelectItem {
  value: string
  label: string
}

interface SelectProps extends HTMLAttributes {
  modelValue: string
  placeholder?: string
  class?: string
}

const props = defineProps<SelectProps>()
const emit = defineEmits(['update:modelValue'])

const items = ref<SelectItem[]>([])
const open = ref(false)
const selectedLabel = ref('')

const handleSelect = (item: SelectItem) => {
  emit('update:modelValue', item.value)
  selectedLabel.value = item.label
  open.value = false
}

defineExpose({
  addItem: (item: SelectItem) => {
    items.value.push(item)
    if (props.modelValue === item.value) {
      selectedLabel.value = item.label
    }
  }
})
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :class="[
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      ]"
      @click="open = !open"
    >
      <span class="truncate">
        {{ selectedLabel || props.placeholder || 'Select' }}
      </span>
      <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
    </button>
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
      @click.outside="open = false"
    >
      <slot>
        <div class="py-1">
          <button
            v-for="item in items"
            :key="item.value"
            class="relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
            :class="{ 'bg-accent text-accent-foreground': props.modelValue === item.value }"
            @click="handleSelect(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>