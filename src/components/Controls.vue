<script setup lang="ts">
import { computed, ref } from "vue";
import { FileUp, Plus, Trash2 } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  manualLink: string;
  manualLegend: string;
  manualError: string;
  csvSummary: string;
  qrCount: number;
  canAdd: boolean;
  canClear: boolean;
  isDraftGenerating: boolean;
  isBusy: boolean;
}>();

const emit = defineEmits<{
  "update:manualLink": [value: string];
  "update:manualLegend": [value: string];
  addManual: [];
  clearList: [];
  csvUpload: [file: File];
}>();

const { t } = useI18n();

const dragDepth = ref(0);
const isDragging = ref(false);
const readyLabel = computed(() =>
  t("controls.qrReady", { count: props.qrCount }, props.qrCount),
);
const uploadHint = computed(() =>
  props.isBusy ? t("controls.csvHintBusy") : t("controls.csvHintIdle"),
);

function onManualLinkInput(event: Event) {
  emit("update:manualLink", (event.target as HTMLInputElement).value);
}

function onManualLegendInput(event: Event) {
  emit("update:manualLegend", (event.target as HTMLInputElement).value);
}

function onCsvUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file && !props.isBusy) {
    emit("csvUpload", file);
  }

  input.value = "";
}

function onDragEnter(event: DragEvent) {
  if (!hasFileDrag(event)) {
    return;
  }

  dragDepth.value += 1;
  isDragging.value = true;
}

function onDragOver(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = props.isBusy ? "none" : "copy";
  }
}

function onDragLeave() {
  dragDepth.value = Math.max(0, dragDepth.value - 1);
  isDragging.value = dragDepth.value > 0;
}

function onDrop(event: DragEvent) {
  dragDepth.value = 0;
  isDragging.value = false;

  if (props.isBusy) {
    return;
  }

  const file = getDroppedCsvFile(event);

  if (file) {
    emit("csvUpload", file);
  }
}

function hasFileDrag(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function getDroppedCsvFile(event: DragEvent) {
  const files = Array.from(event.dataTransfer?.files ?? []);
  return files.find((file) => file.name.toLowerCase().endsWith(".csv")) ?? files[0];
}
</script>

<template>
  <form
    class="flex min-h-0 flex-col gap-4 overflow-auto rounded-md border border-(--color-border) bg-(--color-surface) p-4 shadow-sm"
    @submit.prevent="emit('addManual')"
  >
    <div class="space-y-1.5">
      <label for="manual-link" class="text-sm font-semibold text-(--color-heading)">
        {{ t("controls.linkLabel") }}
      </label>
      <input
        id="manual-link"
        :value="manualLink"
        type="text"
        inputmode="url"
        :placeholder="t('controls.linkPlaceholder')"
        class="h-11 w-full rounded-md border border-(--color-border) bg-(--color-input-bg) px-3 text-sm outline-none transition focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-focus-ring)"
        @input="onManualLinkInput"
      />
      <p v-if="manualError" class="text-xs font-medium text-(--color-error)">
        {{ manualError }}
      </p>
    </div>

    <div class="space-y-1.5">
      <label for="manual-legend" class="text-sm font-semibold text-(--color-heading)">
        {{ t("controls.legendLabel") }}
      </label>
      <input
        id="manual-legend"
        :value="manualLegend"
        type="text"
        :placeholder="t('controls.legendPlaceholder')"
        class="h-11 w-full rounded-md border border-(--color-border) bg-(--color-input-bg) px-3 text-sm outline-none transition focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-focus-ring)"
        @input="onManualLegendInput"
      />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button
        type="submit"
        :disabled="!canAdd || isDraftGenerating"
        class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-(--color-accent) px-3 text-sm font-semibold text-(--color-surface) transition hover:bg-(--color-accent-hover) disabled:cursor-not-allowed disabled:bg-(--color-accent-disabled)"
      >
        <Plus class="size-4" aria-hidden="true" />
        {{ t("controls.addButton") }}
      </button>

      <button
        type="button"
        :disabled="!canClear"
        class="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 text-sm font-semibold text-(--color-heading) transition hover:bg-(--color-soft-hover) disabled:cursor-not-allowed disabled:text-(--color-primary-disabled)"
        @click="emit('clearList')"
      >
        <Trash2 class="size-4" aria-hidden="true" />
        {{ t("controls.clearButton") }}
      </button>
    </div>

    <div
      class="border-t border-(--color-border-soft) pt-4"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        class="sr-only"
        :disabled="isBusy"
        @change="onCsvUpload"
      />
      <label
        for="csv-upload"
        class="flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-3 py-4 text-center text-sm font-semibold transition"
        :class="
          isDragging
            ? 'border-(--color-accent) bg-(--color-soft-bg) text-(--color-accent)'
            : 'border-(--color-border-strong) bg-(--color-panel-bg) text-(--color-heading) hover:border-(--color-accent) hover:text-(--color-accent)'
        "
      >
        <FileUp class="size-4" aria-hidden="true" />
        {{ t("controls.csvImport") }}
        <span class="text-xs font-medium text-(--color-muted)">
          {{ uploadHint }}
        </span>
      </label>
      <p class="mt-2 text-xs leading-5 text-(--color-muted)">
        {{ t("controls.csvColumns") }}
      </p>
      <p v-if="csvSummary" class="mt-2 text-xs font-medium text-(--color-info)">
        {{ csvSummary }}
      </p>
    </div>

    <div class="mt-auto rounded-md bg-(--color-soft-bg) px-3 py-2 text-xs text-(--color-muted)">
      {{ readyLabel }}
    </div>
  </form>
</template>
