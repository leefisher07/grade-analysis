<script setup lang="ts">
import { FileDown, FileUp, Printer, Rocket } from 'lucide-vue-next'
import Button from './ui/Button.vue'

interface BottomToolbarProps {
  onImportExcel: () => void
  onPrintPreview: () => void
  onExportExcel: () => void
  onGenerateAll: () => void
  totalPending: number
  isGenerating: boolean
}

const props = defineProps<BottomToolbarProps>()
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
    <div class="flex h-12 items-center justify-between px-4">
      <!-- Left: Import -->
      <Button variant="outline" size="sm" @click="props.onImportExcel" class="h-8 bg-transparent">
        <FileDown class="mr-1.5 h-4 w-4" />
        导入 Excel
      </Button>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="props.onPrintPreview" class="h-8 bg-transparent">
          <Printer class="mr-1.5 h-4 w-4" />
          打印预览
        </Button>
        <Button variant="outline" size="sm" @click="props.onExportExcel" class="h-8 bg-transparent">
          <FileUp class="mr-1.5 h-4 w-4" />
          导出 Excel
        </Button>
        <Button
          variant="default"
          size="sm"
          @click="props.onGenerateAll"
          :disabled="props.isGenerating || props.totalPending === 0"
          class="h-8 px-4"
        >
          <Rocket
            class="mr-1.5 h-4 w-4"
            :class="{ 'animate-bounce': props.isGenerating }"
          />
          一键生成所有评语
        </Button>
      </div>
    </div>
  </div>
</template>