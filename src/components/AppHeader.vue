<script setup lang="ts">
import { QrCode } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./LanguageSwitcher.vue";

const { t } = useI18n();
</script>

<template>
  <header class="flex items-center justify-between border-b border-(--color-border) pb-3">
    <div class="flex items-center gap-3">
      <div class="grid size-10 place-items-center rounded-md bg-(--color-accent) text-(--color-surface) shadow-sm">
        <QrCode class="size-5" aria-hidden="true" />
      </div>
      <div>
        <h1 class="text-xl font-semibold tracking-normal">QR Coder</h1>
        <p class="text-sm text-(--color-muted)">{{ t("header.subtitle") }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <div class="hidden rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-medium text-(--color-muted) sm:block">
        {{ t("header.pngBadge") }}
      </div>
      <LanguageSwitcher />
    </div>
  </header>
</template>
