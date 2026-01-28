<script setup lang="ts">
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  class?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default'
})

const variants: Record<ButtonVariant, string> = {
  default: 'bg-sky-500 text-white hover:bg-sky-600',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-sky-300 text-sky-600 hover:bg-sky-50',
  secondary: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
  ghost: 'hover:bg-sky-50 hover:text-sky-700',
  link: 'text-sky-600 underline-offset-4 hover:underline hover:text-sky-700'
}

const sizes: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10'
}
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
      variants[props.variant],
      sizes[props.size],
      props.class
    ]"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>