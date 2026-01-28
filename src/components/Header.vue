<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'
import Badge from './ui/Badge.vue'

interface HeaderProps {
  quota: number
}

const props = defineProps<HeaderProps>()
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
    <div class="flex h-12 items-center justify-between px-4">
      <!-- Left: Logo + Title -->
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <GraduationCap class="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 class="text-lg font-bold text-primary">智能评语系统</h1>
      </div>

      <!-- Right: Quota Info -->
      <Badge
        variant="outline"
        class="flex items-center gap-2 rounded-full border-green-200 bg-green-50 px-3 py-1 text-green-700"
      >
        <span class="h-2 w-2 rounded-full bg-green-500" />
        剩余额度: {{ props.quota.toLocaleString() }} 次
      </Badge>
    </div>
  </header>
</template>