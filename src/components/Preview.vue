<script setup lang="ts">
import { Download, FileArchive, Trash2 } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import Carousel from "./Carousel.vue";
import type { QrItem } from "../types/qr";

defineProps<{
  currentIndex: number;
  totalItems: number;
  downloadLabel: string;
  canDownload: boolean;
  isBusy: boolean;
  statusMessage: string;
  isGenerating: boolean;
  hasListItems: boolean;
  currentItem: QrItem | null;
  hasMultipleItems: boolean;
}>();

const emit = defineEmits<{
  download: [];
  removeCurrent: [];
  previous: [];
  next: [];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="flex min-h-0 flex-col rounded-md border border-(--color-border) bg-(--color-surface) p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-(--color-heading)">{{ t("preview.title") }}</h2>
        <p class="text-xs text-(--color-muted)">
          {{
            totalItems > 0
              ? t("preview.ofTotal", { current: currentIndex + 1, total: totalItems })
              : t("preview.empty")
          }}
        </p>
      </div>

      <button
        type="button"
        :disabled="!canDownload || isBusy"
        class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-(--color-primary) px-3 text-sm font-semibold text-(--color-surface) transition hover:bg-(--color-primary-hover) disabled:cursor-not-allowed disabled:bg-(--color-primary-disabled)"
        @click="emit('download')"
      >
        <component
          :is="totalItems > 1 ? FileArchive : Download"
          class="size-4"
          aria-hidden="true"
        />
        {{ downloadLabel }}
      </button>
    </div>

    <Carousel
      :item="currentItem"
      :has-multiple-items="hasMultipleItems"
      @previous="emit('previous')"
      @next="emit('next')"
    />

    <div class="mt-3 flex min-h-10 items-center justify-between gap-3">
      <p class="min-w-0 truncate text-xs font-medium text-(--color-muted)">
        <span v-if="isGenerating">{{ t("preview.generating") }}</span>
        <span v-else>{{ statusMessage }}</span>
      </p>

      <button
        v-if="hasListItems"
        type="button"
        :title="t('preview.removeAria')"
        :aria-label="t('preview.removeAria')"
        class="grid size-9 shrink-0 place-items-center rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-danger) transition hover:bg-(--color-danger-bg)"
        @click="emit('removeCurrent')"
      >
        <Trash2 class="size-4" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>
