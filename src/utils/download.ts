import JSZip from "jszip";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { QrItem } from "../types/qr";
import { buildUniqueFileNames } from "./files";

export async function downloadQrItems(list: QrItem[]) {
  if (list.length === 0) {
    return false;
  }

  if (list.length === 1) {
    const item = list[0];
    return saveBytes(`${item.fileBaseName}.png`, item.bytes, [
      { name: "PNG", extensions: ["png"] },
    ]);
  }

  const zip = new JSZip();
  const names = buildUniqueFileNames(list);

  list.forEach((item, index) => {
    zip.file(names[index], item.bytes);
  });

  const zipBytes = await zip.generateAsync({ type: "uint8array" });

  return saveBytes("qrcodes.zip", zipBytes, [
    { name: "ZIP", extensions: ["zip"] },
  ]);
}

async function saveBytes(
  defaultPath: string,
  bytes: Uint8Array,
  filters: Array<{ name: string; extensions: string[] }>,
) {
  if (isTauriRuntime()) {
    const path = await save({
      defaultPath,
      filters,
    });

    if (!path) {
      return false;
    }

    await writeFile(path, bytes);
    return true;
  }

  // Ensure we pass an ArrayBuffer (not a SharedArrayBuffer) to satisfy TypeScript BlobPart.
  const tmp = new Uint8Array(bytes.length);
  tmp.set(bytes);
  const blob = new Blob([tmp.buffer], {
    type: defaultPath.endsWith(".zip") ? "application/zip" : "image/png",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = defaultPath;
  link.click();
  URL.revokeObjectURL(url);

  return true;
}

function isTauriRuntime() {
  return Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}
