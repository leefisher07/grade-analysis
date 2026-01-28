<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import Badge from './ui/Badge.vue'
import Input from './ui/Input.vue'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

const props = defineProps<TagInputProps>()
const emit = defineEmits(['update:tags'])

const inputValue = ref('')

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && inputValue.value.trim()) {
    e.preventDefault()
    if (!props.tags.includes(inputValue.value.trim())) {
      emit('update:tags', [...props.tags, inputValue.value.trim()])
    }
    inputValue.value = ''
  }
}

const removeTag = (tagToRemove: string) => {
  emit('update:tags', props.tags.filter(tag => tag !== tagToRemove))
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 min-w-[120px]">
    <Badge
      v-for="tag in props.tags"
      :key="tag"
      variant="secondary"
      class="flex items-center gap-0.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs px-1.5 py-0"
    >
      {{ tag }}
      <button
        @click="removeTag(tag)"
        class="ml-0.5 rounded-full hover:bg-primary/20"
      >
        <X class="h-2.5 w-2.5" />
      </button>
    </Badge>
    <Input
      v-model="inputValue"
      @keydown="handleKeyDown"
      placeholder="回车添加"
      class="h-6 w-16 flex-1 min-w-[50px] border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
    />
  </div>
</template>