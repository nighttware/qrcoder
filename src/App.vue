<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AppHeader from "./components/AppHeader.vue";
import Controls from "./components/Controls.vue";
import LoadingOverlay from "./components/LoadingOverlay.vue";
import Preview from "./components/Preview.vue";
import type { QrItem } from "./types/qr";
import { buildCsvSummary, parseQrCsv } from "./utils/csv";
import { downloadQrItems } from "./utils/download";
import { buildFileBaseName, makeId } from "./utils/files";
import { isValidQrTarget, normalizeLink } from "./utils/links";
import { createQrItem } from "./utils/qr";

const { t } = useI18n();

const manualLink = ref("");
const manualLegend = ref("");
const draftItem = ref<QrItem | null>(null);
const items = ref<QrItem[]>([]);
const currentIndex = ref(0);
const isDraftGenerating = ref(false);
const isBatchGenerating = ref(false);
const isDownloading = ref(false);
const manualError = ref("");
const csvSummary = ref("");
const statusMessage = ref("");
const loadingTitle = ref("");
const loadingDescription = ref("");
const loadingCurrent = ref<number | null>(null);
const loadingTotal = ref<number | null>(null);
let draftVersion = 0;

const activeItems = computed(() => {
  if (items.value.length > 0) {
    return items.value;
  }

  return draftItem.value ? [draftItem.value] : [];
});

const currentItem = computed(() => activeItems.value[currentIndex.value] ?? null);
const hasMultipleItems = computed(() => activeItems.value.length > 1);
const hasListItems = computed(() => items.value.length > 0);
const canAddManual = computed(() => Boolean(draftItem.value));
const canDownload = computed(() => activeItems.value.length > 0);
const isGenerating = computed(() => isDraftGenerating.value || isBatchGenerating.value);
const showLoadingOverlay = computed(() => isBatchGenerating.value || isDownloading.value);
const isBusy = computed(
  () => isDraftGenerating.value || isBatchGenerating.value || isDownloading.value,
);
const downloadLabel = computed(() =>
  activeItems.value.length > 1 ? t("preview.downloadZip") : t("preview.downloadPng"),
);

watch(
  () => activeItems.value.length,
  (length) => {
    if (length === 0) {
      currentIndex.value = 0;
      return;
    }

    if (currentIndex.value > length - 1) {
      currentIndex.value = length - 1;
    }
  },
);

watch([manualLink, manualLegend], () => {
  void refreshDraftQr();
});

async function refreshDraftQr() {
  const version = ++draftVersion;
  const rawLink = manualLink.value.trim();

  if (!rawLink) {
    draftItem.value = null;
    manualError.value = "";
    return;
  }

  const link = normalizeLink(rawLink);

  if (!isValidQrTarget(link)) {
    draftItem.value = null;
    manualError.value = t("messages.invalidLink");
    return;
  }

  isDraftGenerating.value = true;
  manualError.value = "";

  try {
    const item = await createQrItem(link, manualLegend.value, items.value.length + 1);

    if (version === draftVersion) {
      draftItem.value = item;
      statusMessage.value = "";

      if (items.value.length === 0) {
        currentIndex.value = 0;
      }
    }
  } catch {
    if (version === draftVersion) {
      draftItem.value = null;
      manualError.value = t("messages.qrFailed");
    }
  } finally {
    if (version === draftVersion) {
      isDraftGenerating.value = false;
    }
  }
}

async function handleCsvUpload(file: File) {
  if (!isCsvFile(file)) {
    csvSummary.value = t("messages.csvInvalidFile");
    return;
  }

  isBatchGenerating.value = true;
  csvSummary.value = "";
  statusMessage.value = "";
  loadingTitle.value = t("loading.csvTitle");
  loadingDescription.value = t("loading.csvReading");
  loadingCurrent.value = null;
  loadingTotal.value = null;

  try {
    const text = await file.text();
    const { items: generated, ignoredRows, parserErrors } = await parseQrCsv(
      text,
      ({ processedRows, totalRows, generatedCount, ignoredRows: ignoredCount }) => {
        loadingCurrent.value = processedRows;
        loadingTotal.value = totalRows;
        loadingDescription.value =
          totalRows > 0
            ? `${t("loading.csvProgressGenerated", { count: generatedCount }, generatedCount)}; ${t("loading.csvProgressIgnored", { count: ignoredCount }, ignoredCount)}`
            : t("loading.csvEmpty");
      },
    );

    if (generated.length === 0) {
      items.value = [];
      csvSummary.value = buildCsvSummary(generated.length, ignoredRows, parserErrors);
      return;
    }

    items.value = generated;
    manualLink.value = "";
    manualLegend.value = "";
    draftItem.value = null;
    currentIndex.value = 0;

    csvSummary.value = buildCsvSummary(generated.length, ignoredRows, parserErrors);
  } catch (error) {
    const message = error instanceof Error ? error.message : t("messages.csvReadFailed");
    items.value = [];
    csvSummary.value = message;
  } finally {
    isBatchGenerating.value = false;
    clearLoadingState();
  }
}

function addManualToList() {
  if (!draftItem.value) {
    return;
  }

  const item = {
    ...draftItem.value,
    id: makeId(),
    fileBaseName: buildFileBaseName(
      draftItem.value.link,
      draftItem.value.legenda,
      items.value.length + 1,
    ),
  };

  items.value = [...items.value, item];
  currentIndex.value = items.value.length - 1;
  manualLink.value = "";
  manualLegend.value = "";
  draftItem.value = null;
  manualError.value = "";
  statusMessage.value = t("messages.qrAdded");
}

function clearList() {
  items.value = [];
  currentIndex.value = 0;
  statusMessage.value = draftItem.value
    ? t("messages.listClearedKeepDraft")
    : t("messages.listCleared");
}

function removeCurrentItem() {
  if (!hasListItems.value) {
    return;
  }

  items.value.splice(currentIndex.value, 1);
  currentIndex.value = Math.min(currentIndex.value, Math.max(items.value.length - 1, 0));
  statusMessage.value = items.value.length > 0
    ? t("messages.qrRemoved")
    : t("messages.listEmpty");
}

function previousItem() {
  if (!hasMultipleItems.value) {
    return;
  }

  currentIndex.value =
    (currentIndex.value - 1 + activeItems.value.length) % activeItems.value.length;
}

function nextItem() {
  if (!hasMultipleItems.value) {
    return;
  }

  currentIndex.value = (currentIndex.value + 1) % activeItems.value.length;
}

async function downloadActiveItems() {
  const list = activeItems.value;

  if (list.length === 0) {
    return;
  }

  isDownloading.value = true;
  statusMessage.value = "";
  loadingTitle.value = activeItems.value.length > 1
    ? t("loading.zipTitle")
    : t("loading.pngTitle");
  loadingDescription.value =
    activeItems.value.length > 1
      ? t("loading.zipDescription", { count: activeItems.value.length })
      : t("loading.pngDescription");
  loadingCurrent.value = null;
  loadingTotal.value = null;

  try {
    const saved = await downloadQrItems(list);
    statusMessage.value = saved
      ? list.length === 1
        ? t("messages.downloadPngOk")
        : t("messages.downloadZipOk")
      : t("messages.downloadCanceled");
  } catch {
    statusMessage.value = t("messages.downloadFailed");
  } finally {
    isDownloading.value = false;
    clearLoadingState();
  }
}

function clearLoadingState() {
  loadingTitle.value = "";
  loadingDescription.value = "";
  loadingCurrent.value = null;
  loadingTotal.value = null;
}

function isCsvFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel"
  );
}
</script>

<template>
  <main class="h-screen w-screen overflow-hidden bg-(--color-app-bg) p-4 text-(--color-app-text) sm:p-5">
    <section class="mx-auto flex h-full w-full max-w-245 flex-col overflow-hidden">
      <AppHeader />
      <div class="grid min-h-0 flex-1 grid-cols-1 gap-4 pt-4 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
        <Controls
          v-model:manual-link="manualLink"
          v-model:manual-legend="manualLegend"
          :manual-error="manualError"
          :csv-summary="csvSummary"
          :qr-count="activeItems.length"
          :can-add="canAddManual"
          :can-clear="hasListItems"
          :is-draft-generating="isDraftGenerating"
          :is-busy="isBusy"
          @add-manual="addManualToList"
          @clear-list="clearList"
          @csv-upload="handleCsvUpload"
        />

        <Preview
          :current-index="currentIndex"
          :total-items="activeItems.length"
          :download-label="downloadLabel"
          :can-download="canDownload"
          :is-busy="isBusy"
          :status-message="statusMessage"
          :is-generating="isGenerating"
          :has-list-items="hasListItems"
          :current-item="currentItem"
          :has-multiple-items="hasMultipleItems"
          @download="downloadActiveItems"
          @remove-current="removeCurrentItem"
          @previous="previousItem"
          @next="nextItem"
        />
      </div>
    </section>

    <LoadingOverlay
      :visible="showLoadingOverlay"
      :title="loadingTitle"
      :description="loadingDescription"
      :current="loadingCurrent"
      :total="loadingTotal"
    />
  </main>
</template>
