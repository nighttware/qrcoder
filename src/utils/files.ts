import type { QrItem } from "../types/qr";

export function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function buildFileBaseName(link: string, legenda: string, index: number) {
  const fallback = `qr-${String(index).padStart(3, "0")}`;

  if (legenda) {
    return sanitizeFileName(legenda, fallback);
  }

  try {
    return sanitizeFileName(new URL(link).hostname, fallback);
  } catch {
    return fallback;
  }
}

export function buildUniqueFileNames(list: QrItem[]) {
  const used = new Map<string, number>();

  return list.map((item, index) => {
    const base = sanitizeFileName(
      item.fileBaseName,
      `qr-${String(index + 1).padStart(3, "0")}`,
    );
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);

    return count === 0 ? `${base}.png` : `${base}-${count + 1}.png`;
  });
}

function sanitizeFileName(value: string, fallback: string) {
  const clean = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return clean || fallback;
}
