import { parse } from "papaparse";
import type { CsvQrImportProgress, CsvQrImportResult } from "../types/csv";
import type { QrItem } from "../types/qr";
import { createQrItem } from "./qr";
import { isValidQrTarget, normalizeLink } from "./links";
import { i18n } from "../i18n";

const t = (key: string, named?: Record<string, unknown>) =>
  named ? i18n.global.t(key, named) : i18n.global.t(key);
const tn = (key: string, count: number) =>
  i18n.global.t(key, { count }, count);

type CsvQrImportProgressHandler = (progress: CsvQrImportProgress) => void;

export async function parseQrCsv(
  text: string,
  onProgress?: CsvQrImportProgressHandler,
): Promise<CsvQrImportResult> {
  const parsed = parse<Record<string, string>>(text, {
    delimiter: "",
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  const fields = parsed.meta.fields ?? [];

  const linkCol = normalizeHeader(t("csv.columnLink"));
  const legendCol = normalizeHeader(t("csv.columnLegend"));

  if (!fields.includes(linkCol)) {
    throw new Error(t("csv.missingLinkColumn"));
  }

  const items: QrItem[] = [];
  const rows = parsed.data.filter((row) => {
    const rawLink = readCsvField(row, linkCol);
    const rawLegend = readCsvField(row, legendCol);
    return Boolean(rawLink || rawLegend);
  });
  let ignoredRows = 0;
  let processedRows = 0;

  onProgress?.({
    processedRows,
    totalRows: rows.length,
    generatedCount: items.length,
    ignoredRows,
  });

  for (const row of rows) {
    const rawLink = readCsvField(row, linkCol);
    const rawLegend = readCsvField(row, legendCol);

    const link = normalizeLink(rawLink);

    if (!rawLink || !isValidQrTarget(link)) {
      ignoredRows += 1;
      processedRows += 1;
      onProgress?.({
        processedRows,
        totalRows: rows.length,
        generatedCount: items.length,
        ignoredRows,
      });
      continue;
    }

    items.push(await createQrItem(link, rawLegend, items.length + 1));
    processedRows += 1;

    onProgress?.({
      processedRows,
      totalRows: rows.length,
      generatedCount: items.length,
      ignoredRows,
    });
  }

  return {
    items,
    ignoredRows,
    parserErrors: parsed.errors.length,
  };
}

export function buildCsvSummary(
  generatedCount: number,
  ignoredRows: number,
  parserErrors: number,
) {
  if (generatedCount === 0) {
    return t("csv.summaryEmpty");
  }

  const parts = [tn("csv.summaryGenerated", generatedCount)];

  if (ignoredRows > 0) {
    parts.push(tn("csv.summaryIgnored", ignoredRows));
  }

  if (parserErrors > 0) {
    parts.push(tn("csv.summaryWarnings", parserErrors));
  }

  return parts.join(" ");
}

function readCsvField(row: Record<string, string>, field: string) {
  const value = row[field];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHeader(header: string) {
  return header
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
