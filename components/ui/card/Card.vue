<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'border-3 border-foreground bg-card text-card-foreground shadow-brutal transition-all duration-200',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
