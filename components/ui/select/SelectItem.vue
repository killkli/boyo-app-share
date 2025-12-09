<script setup lang="ts">
import type { SelectItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check } from "lucide-vue-next"
import {
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  useForwardProps,
} from "reka-ui"
import { cn } from '~/lib/utils'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-pointer select-none items-center py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition-all duration-100 hover:bg-[#CCFF00] hover:translate-x-[2px] focus:bg-[#CCFF00] focus:translate-x-[2px] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-[#F5F5F5] data-[state=checked]:font-bold',
        props.class,
      )
    "
    style="background-color: #FFFFFF; color: #000000;"
  >
    <span class="absolute left-2.5 flex h-4 w-4 items-center justify-center">
      <SelectItemIndicator>
        <Check class="h-4 w-4 stroke-[3]" />
      </SelectItemIndicator>
    </span>

    <SelectItemText class="font-medium">
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
