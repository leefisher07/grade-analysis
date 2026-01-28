<script setup lang="ts">
import { ref } from 'vue'
import { Settings, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Button from './ui/Button.vue'
import Input from './ui/Input.vue'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  wordCount: number
  onWordCountChange: (value: number) => void
  rowCount: number
  onRowCountChange: (value: number) => void
  onAddRows: () => void
  onRemoveRows: () => void
  onClearAll: () => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

const props = defineProps<SidebarProps>()
const emit = defineEmits(['update:activeTab', 'update:wordCount', 'update:rowCount'])

const settingsOpen = ref(true)

const tabs = [
  { id: 'kindergarten', label: '幼儿园', short: '幼' },
  { id: 'primary', label: '小学', short: '小' },
  { id: 'middle', label: '初中', short: '中' },
]

const handleWordCountChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (!isNaN(value) && value >= 1 && value <= 300) {
    props.onWordCountChange(value)
  } else if (target.value === '') {
    props.onWordCountChange(100)
  }
}

const handleRowCountChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (!isNaN(value) && value >= 1 && value <= 50) {
    props.onRowCountChange(value)
  } else if (target.value === '') {
    props.onRowCountChange(1)
  }
}
</script>

<template>
  <!-- Collapsed state -->
  <aside v-if="props.collapsed" class="w-12 shrink-0 flex flex-col gap-2 py-2">
    <!-- Expand Button -->
    <div class="mx-auto">
      <Button
        variant="ghost"
        size="icon"
        @click="props.onCollapsedChange(false)"
        class="h-8 w-8"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>

    <!-- Tab Selection -->
    <div class="flex flex-col gap-1 px-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="props.onTabChange(tab.id)"
        class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors"
        :class="props.activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'"
        :title="tab.label"
      >
        {{ tab.short }}
      </button>
    </div>

    <!-- Settings Icon -->
    <div class="mx-auto mt-2">
      <Button
        variant="ghost"
        size="icon"
        @click="props.onCollapsedChange(false)"
        class="h-8 w-8"
        title="表格设置"
      >
        <Settings class="h-4 w-4" />
      </Button>
    </div>
  </aside>

  <!-- Expanded state -->
  <aside v-else class="w-44 shrink-0 space-y-3 flex flex-col">
    <!-- Collapse Button -->
    <div class="flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        @click="props.onCollapsedChange(true)"
        class="h-7 px-2 text-xs text-muted-foreground"
      >
        <ChevronLeft class="h-3 w-3 mr-1" />
        收起
      </Button>
    </div>

    <!-- Tab Selection -->
    <div class="rounded-lg border bg-card p-1.5 shadow-sm">
      <div class="mb-1.5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
        学段
      </div>
      <nav class="space-y-0.5">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="props.onTabChange(tab.id)"
          class="w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors"
          :class="props.activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Settings Panel -->
    <div class="rounded-lg border bg-card shadow-sm">
      <button
        class="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-t-lg transition-colors"
        @click="settingsOpen = !settingsOpen"
      >
        <span class="flex items-center gap-1.5">
          <Settings class="h-3.5 w-3.5" />
          设置
        </span>
        <span class="text-[10px] text-muted-foreground">
          {{ settingsOpen ? '收起' : '展开' }}
        </span>
      </button>
      <div v-if="settingsOpen" class="border-t px-3 py-3 space-y-3">
        <!-- Word Count -->
        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">
            评语字数 (最大300)
          </label>
          <Input
            type="number"
            min="1"
            max="300"
            v-model="props.wordCount"
            @input="handleWordCountChange"
            class="h-8 text-sm"
          />
        </div>

        <!-- Row Operations -->
        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">
            行数操作
          </label>
          <div class="flex items-center gap-1.5">
            <Input
              type="number"
              min="1"
              max="50"
              v-model="props.rowCount"
              @input="handleRowCountChange"
              class="h-8 w-14 text-sm"
            />
            <span class="text-xs text-muted-foreground">行</span>
          </div>
          <div class="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              @click="props.onAddRows"
              class="flex-1 h-7 text-xs bg-transparent"
            >
              增加
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="props.onRemoveRows"
              class="flex-1 h-7 text-xs bg-transparent"
            >
              减少
            </Button>
          </div>
        </div>

        <!-- Clear All -->
        <div class="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            @click="props.onClearAll"
            class="w-full h-7 text-xs text-destructive border-destructive/50 hover:bg-destructive/10 bg-transparent"
          >
            <Trash2 class="mr-1.5 h-3 w-3" />
            一键清空
          </Button>
        </div>
      </div>
    </div>
  </aside>
</template>