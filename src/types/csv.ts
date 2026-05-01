import type { QrItem } from "./qr";

export type CsvQrImportResult = {
  items: QrItem[];
  ignoredRows: number;
  parserErrors: number;
};

export type CsvQrImportProgress = {
  processedRows: number;
  totalRows: number;
  generatedCount: number;
  ignoredRows: number;
};
