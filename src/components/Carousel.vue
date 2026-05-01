<script setup lang="ts">
import { ChevronLeft, ChevronRight, QrCode } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import type { QrItem } from "../types/qr";

defineProps<{
  item: QrItem | null;
  hasMultipleItems: boolean;
}>();

const emit = defineEmits<{
  previous: [];
  next: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="relative grid min-h-0 flex-1 place-items-center overflow-hidden rounded-md border border-(--color-border-soft) bg-(--color-panel-bg) p-3">
    <button
      type="button"
      :title="t('carousel.previousAria')"
      :aria-label="t('carousel.previousAria')"
      :disabled="!hasMultipleItems"
      class="absolute left-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-heading) shadow-sm transition hover:bg-(--color-carousel-hover) disabled:cursor-not-allowed disabled:opacity-35"
      @click="emit('previous')"
    >
      <ChevronLeft class="size-5" aria-hidden="true" />
    </button>

    <div v-if="item" class="flex h-full w-full flex-col items-center justify-center gap-3 px-10">
      <img
        :src="item.dataUrl"
        :alt="item.legenda ? t('carousel.altWithLegend', { legend: item.legenda }) : t('carousel.altDefault')"
        class="max-h-82.5 max-w-full rounded-sm bg-(--color-surface) object-contain shadow-sm"
      />
      <div class="max-w-full text-center">
        <p class="truncate text-sm font-semibold text-(--color-heading)">
          {{ item.legenda || item.fileBaseName }}
        </p>
        <p class="max-w-85 truncate text-xs text-(--color-muted)">
          {{ item.link }}
        </p>
      </div>
    </div>

    <div v-else class="px-8 text-center">
      <QrCode class="mx-auto mb-3 size-12 text-(--color-icon-muted)" aria-hidden="true" />
      <p class="text-sm font-semibold text-(--color-heading)">{{ t("carousel.empty") }}</p>
      <p class="mt-1 text-xs text-(--color-muted)">
        {{ t("carousel.emptyHint") }}
      </p>
    </div>

    <button
      type="button"
      :title="t('carousel.nextAria')"
      :aria-label="t('carousel.nextAria')"
      :disabled="!hasMultipleItems"
      class="absolute right-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-heading) shadow-sm transition hover:bg-(--color-carousel-hover) disabled:cursor-not-allowed disabled:opacity-35"
      @click="emit('next')"
    >
      <ChevronRight class="size-5" aria-hidden="true" />
    </button>
  </div>
</template>
