<script setup lang="ts">
import { computed } from "vue";
import { LoaderCircle } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  visible: boolean;
  title: string;
  description: string;
  current?: number | null;
  total?: number | null;
}>();

const { t } = useI18n();

const hasProgress = computed(
  () =>
    typeof props.current === "number" &&
    typeof props.total === "number" &&
    props.total > 0,
);

const progressPercent = computed(() => {
  if (!hasProgress.value || typeof props.current !== "number" || typeof props.total !== "number") {
    return 0;
  }

  return Math.min(100, Math.round((props.current / props.total) * 100));
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-50 grid place-items-center bg-(--color-overlay-bg) p-6 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="w-full max-w-95 rounded-md border border-(--color-border) bg-(--color-surface) p-5 text-center shadow-[0_18px_50px_var(--color-overlay-shadow)]">
        <LoaderCircle class="mx-auto size-9 animate-spin text-(--color-accent)" aria-hidden="true" />

        <h2 class="mt-4 text-base font-semibold text-(--color-heading)">
          {{ title }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-(--color-muted)">
          {{ description }}
        </p>

        <div v-if="hasProgress" class="mt-4">
          <div class="h-2 overflow-hidden rounded-full bg-(--color-soft-bg)">
            <div
              class="h-full rounded-full bg-(--color-accent) transition-all duration-200"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <p class="mt-2 text-xs font-medium text-(--color-muted)">
            {{ t("loading.progressLine", { current, total }) }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
