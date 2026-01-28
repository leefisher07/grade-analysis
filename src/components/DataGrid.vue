<script setup lang="ts">
import { computed } from 'vue'
import { type SchoolStage, type Student, stylesByStage } from '@/types'
import { RefreshCw, Sparkles, Trash2, Info } from 'lucide-vue-next'
import Button from './ui/Button.vue'
import Input from './ui/Input.vue'
import Badge from './ui/Badge.vue'
import StyleSelector from './StyleSelector.vue'
import TagInput from './TagInput.vue'
import TypewriterText from './TypewriterText.vue'

interface DataGridProps {
  students: Student[]
  onStudentChange: (id: number, field: keyof Student, value: string | string[]) => void
  onGenerate: (id: number) => void
  onRegenerate: (id: number) => void
  onDeleteRow: (id: number) => void
  globalStyle: string
  onGlobalStyleChange: (style: string) => void
  activeStage: SchoolStage
}

const props = defineProps<DataGridProps>()
const emit = defineEmits(['update:students', 'update:globalStyle'])

const currentStyles = computed(() => stylesByStage[props.activeStage])
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Global Style Selector -->
    <div class="flex items-center gap-3 rounded-t-lg border border-b-0 bg-card px-3 py-2 shadow-sm">
      <span class="text-xs font-medium text-foreground whitespace-nowrap">全局风格：</span>
      <div class="w-48">
        <StyleSelector
          :value="props.globalStyle"
          :onChange="props.onGlobalStyleChange"
          :stage="props.activeStage"
        />
      </div>
      <div class="text-muted-foreground cursor-help">
        <Info class="h-3.5 w-3.5" />
        <div class="absolute left-full ml-2 mt-1 w-60 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md">
          设置后，所有学生将使用此风格。如需单独设置，可在该行修改。
        </div>
      </div>
      <span class="text-xs text-muted-foreground ml-auto">
        共 <span class="font-medium text-foreground">{{ props.students.length }}</span> 条数据
      </span>
    </div>

    <!-- Data Table -->
    <div class="flex-1 overflow-hidden rounded-b-lg border bg-card shadow-sm">
      <div class="h-full overflow-auto">
        <table class="w-full">
          <thead class="sticky top-0 z-10 bg-secondary/80 backdrop-blur">
            <tr class="border-b">
              <th class="px-3 py-2 text-left text-xs font-semibold text-foreground w-20">姓名</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-foreground w-16">性别</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-foreground w-32">表现/性格标签</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-foreground w-40">
                <div class="flex items-center gap-1">
                  评语风格
                  <div class="text-muted-foreground cursor-help">
                    <Info class="h-3 w-3" />
                    <div class="absolute left-full ml-2 mt-1 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md">
                      单独设置后不受全局影响
                    </div>
                  </div>
                </div>
              </th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-foreground w-24">操作</th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-foreground">评语内容</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(student, index) in props.students"
              :key="student.id"
              class="border-b transition-colors hover:bg-secondary/30"
              :class="index % 2 === 0 ? 'bg-card' : 'bg-secondary/10'"
            >
              <td class="px-3 py-1.5">
                <Input
                  v-model="student.name"
                  @input="(e) => {
                    const target = e.target as HTMLInputElement
                    if (target) {
                      props.onStudentChange(student.id, 'name', target.value)
                    }
                  }"
                  placeholder="姓名"
                  class="h-7 w-full bg-background text-xs"
                />
              </td>
              <td class="px-3 py-1.5">
                <div class="relative">
                  <button
                    type="button"
                    class="flex h-7 w-full items-center justify-between rounded-md border bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    @click="student.showGenderSelect = !student.showGenderSelect"
                  >
                    {{ student.gender || '选' }}
                  </button>
                  <div
                    v-if="student.showGenderSelect"
                    class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
                    @click.outside="student.showGenderSelect = false"
                  >
                    <div class="py-1">
                      <button
                        class="block w-full px-3 py-2 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                        @click="
                          props.onStudentChange(student.id, 'gender', '男');
                          student.showGenderSelect = false
                        "
                      >
                        男
                      </button>
                      <button
                        class="block w-full px-3 py-2 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                        @click="
                          props.onStudentChange(student.id, 'gender', '女');
                          student.showGenderSelect = false
                        "
                      >
                        女
                      </button>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-1.5">
                <TagInput
                  :tags="student.tags"
                  :onChange="tags => props.onStudentChange(student.id, 'tags', tags)"
                />
              </td>
              <td class="px-3 py-1.5">
                <div class="relative">
                  <StyleSelector
                    :value="student.customStyle || 'inherit'"
                    :onChange="value => props.onStudentChange(student.id, 'customStyle', value)"
                    :stage="props.activeStage"
                    isCustom
                  />
                  <Badge
                    v-if="student.customStyle && student.customStyle !== 'inherit'"
                    variant="outline"
                    class="absolute -top-1.5 -right-1.5 text-[9px] px-1 py-0 bg-primary text-primary-foreground border-0"
                  >
                    独立
                  </Badge>
                </div>
              </td>
              <td class="px-3 py-1.5">
                <div class="flex items-center gap-1">
                  <Button
                    v-if="student.comment"
                    variant="secondary"
                    size="sm"
                    @click="props.onRegenerate(student.id)"
                    :disabled="student.isGenerating"
                    class="h-7 px-2 text-xs"
                  >
                    <RefreshCw
                      class="mr-1 h-3 w-3"
                      :class="{ 'animate-spin': student.isGenerating }"
                    />
                    重写
                  </Button>
                  <Button
                    v-else
                    variant="default"
                    size="sm"
                    @click="props.onGenerate(student.id)"
                    :disabled="student.isGenerating"
                    class="h-7 px-2 text-xs"
                  >
                    <Sparkles
                      class="mr-1 h-3 w-3"
                      :class="{ 'animate-pulse': student.isGenerating }"
                    />
                    生成
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="props.onDeleteRow(student.id)"
                    class="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 class="h-3 w-3" />
                  </Button>
                </div>
              </td>
              <td class="px-3 py-1.5">
                <div class="rounded border bg-background px-2 py-1.5 min-h-[60px] max-h-[100px] overflow-y-auto">
                  <TypewriterText
                    :text="student.comment"
                    :isGenerating="student.isGenerating"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>