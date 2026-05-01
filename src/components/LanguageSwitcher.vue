<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Check, ChevronDown } from "lucide-vue-next";
import { useLocale } from "../composables/useLocale";
import type { SupportedLocale } from "../i18n";

const { t } = useI18n();
const { currentLocale, currentOption, setLocale, localeOptions, localeName } =
  useLocale();

const open = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);
const focusedIndex = ref(0);

const currentIndex = computed(() =>
  localeOptions.findIndex((option) => option.code === currentLocale.value),
);

watch(open, (isOpen) => {
  if (isOpen) {
    focusedIndex.value = currentIndex.value >= 0 ? currentIndex.value : 0;
    nextTick(() => focusActiveOption());
  }
});

function focusActiveOption() {
  const items = listboxRef.value?.querySelectorAll<HTMLElement>(
    "[data-locale-option]",
  );
  items?.[focusedIndex.value]?.focus();
}

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function choose(code: SupportedLocale) {
  setLocale(code);
  close();
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    close();
    return;
  }

  if (!open.value) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open.value = true;
    }
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusedIndex.value = (focusedIndex.value + 1) % localeOptions.length;
    nextTick(() => focusActiveOption());
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    focusedIndex.value =
      (focusedIndex.value - 1 + localeOptions.length) % localeOptions.length;
    nextTick(() => focusActiveOption());
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const option = localeOptions[focusedIndex.value];
    if (option) choose(option.code);
  } else if (event.key === "Home") {
    event.preventDefault();
    focusedIndex.value = 0;
    nextTick(() => focusActiveOption());
  } else if (event.key === "End") {
    event.preventDefault();
    focusedIndex.value = localeOptions.length - 1;
    nextTick(() => focusActiveOption());
  }
}

function onDocumentMouseDown(event: MouseEvent) {
  if (!open.value) return;
  if (containerRef.value && containerRef.value.contains(event.target as Node)) {
    return;
  }
  close();
}

if (typeof document !== "undefined") {
  document.addEventListener("mousedown", onDocumentMouseDown);
}

onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("mousedown", onDocumentMouseDown);
  }
});
</script>

<template>
  <div ref="containerRef" class="relative" @keydown="onKeyDown">
    <button
      type="button"
      :aria-label="t('languageSwitcher.ariaLabel')"
      aria-haspopup="listbox"
      :aria-expanded="open"
      class="inline-flex h-9 items-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-2.5 text-xs font-medium text-(--color-heading) shadow-sm transition hover:bg-(--color-soft-hover) focus:outline-none focus:ring-2 focus:ring-(--color-focus-ring)"
      @click="toggle"
    >
      <component :is="currentOption.flag" class="size-5 shrink-0" />
      <span class="hidden sm:inline">{{ localeName(currentOption.code) }}</span>
      <ChevronDown
        class="size-3.5 shrink-0 text-(--color-muted) transition"
        :class="open ? 'rotate-180' : ''"
        aria-hidden="true"
      />
    </button>

    <ul
      v-if="open"
      ref="listboxRef"
      role="listbox"
      :aria-label="t('languageSwitcher.ariaLabel')"
      class="absolute right-0 top-full z-30 mt-1 min-w-40 overflow-hidden rounded-md border border-(--color-border) bg-(--color-surface) py-1 shadow-lg"
    >
      <li
        v-for="(option, index) in localeOptions"
        :key="option.code"
        role="option"
        data-locale-option
        :aria-selected="option.code === currentLocale"
        :tabindex="focusedIndex === index ? 0 : -1"
        class="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-(--color-heading) outline-none transition hover:bg-(--color-soft-hover) focus:bg-(--color-soft-hover)"
        @click="choose(option.code)"
      >
        <component :is="option.flag" class="size-5 shrink-0" />
        <span class="flex-1">{{ localeName(option.code) }}</span>
        <Check
          v-if="option.code === currentLocale"
          class="size-3.5 text-(--color-accent)"
          aria-hidden="true"
        />
      </li>
    </ul>
  </div>
</template>
