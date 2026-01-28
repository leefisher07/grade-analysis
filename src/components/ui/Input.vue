<script setup lang="ts">
interface InputProps {
  class?: string
  disabled?: boolean
}

const props = defineProps<InputProps>()
</script>

<template>
  <input
    :class="[
      'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    ]"
    :disabled="props.disabled"
  />
</template>