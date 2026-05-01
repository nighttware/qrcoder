import { toCanvas } from "qrcode";
import type { QrItem } from "../types/qr";
import { buildFileBaseName, makeId } from "./files";
import { i18n } from "../i18n";

const QR_PIXELS = 1181;
const MAX_LEGEND_WIDTH = QR_PIXELS - 120;

export async function createQrItem(
  link: string,
  legenda: string,
  index: number,
): Promise<QrItem> {
  const cleanLegend = legenda.trim();
  const { dataUrl, bytes } = await renderQrPng(link, cleanLegend);

  return {
    id: makeId(),
    link,
    legenda: cleanLegend,
    dataUrl,
    bytes,
    fileBaseName: buildFileBaseName(link, cleanLegend, index),
  };
}

async function renderQrPng(link: string, legenda: string) {
  const qrCanvas = document.createElement("canvas");

  await toCanvas(qrCanvas, link, {
    color: {
      dark: getCssColor("--color-qr-dark"),
      light: getCssColor("--color-qr-light"),
    },
    errorCorrectionLevel: "M",
    margin: 2,
    width: QR_PIXELS,
  });

  const legendLayout = getLegendLayout(legenda);
  const legendHeight =
    legendLayout.lines.length > 0
      ? 56 + legendLayout.lines.length * legendLayout.lineHeight + 42
      : 0;
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = QR_PIXELS;
  outputCanvas.height = QR_PIXELS + legendHeight;

  const ctx = getCanvasContext(outputCanvas);
  ctx.fillStyle = getCssColor("--color-qr-light");
  ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  ctx.drawImage(qrCanvas, 0, 0, QR_PIXELS, QR_PIXELS);

  if (legendLayout.lines.length > 0) {
    ctx.fillStyle = getCssColor("--color-qr-dark");
    ctx.font = `600 ${legendLayout.fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    legendLayout.lines.forEach((line, index) => {
      ctx.fillText(
        line,
        QR_PIXELS / 2,
        QR_PIXELS + 42 + index * legendLayout.lineHeight,
      );
    });
  }

  const dataUrl = outputCanvas.toDataURL("image/png");
  const bytes = await dataUrlToBytes(dataUrl);

  return { dataUrl, bytes };
}

function getLegendLayout(legenda: string) {
  const text = legenda.replace(/\s+/g, " ").trim();

  if (!text) {
    return { fontSize: 0, lineHeight: 0, lines: [] as string[] };
  }

  const measureCanvas = document.createElement("canvas");
  const ctx = getCanvasContext(measureCanvas);
  let fontSize = 44;
  let lines: string[] = [];

  while (fontSize >= 26) {
    ctx.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
    lines = wrapText(ctx, text, MAX_LEGEND_WIDTH);

    if (lines.length <= 3 || fontSize === 26) {
      break;
    }

    fontSize -= 2;
  }

  return {
    fontSize,
    lineHeight: Math.round(fontSize * 1.35),
    lines,
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    splitLongWord(ctx, word, maxWidth).forEach((part) => {
      const nextLine = line ? `${line} ${part}` : part;

      if (ctx.measureText(nextLine).width <= maxWidth) {
        line = nextLine;
        return;
      }

      if (line) {
        lines.push(line);
      }

      line = part;
    });
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function splitLongWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  maxWidth: number,
) {
  if (ctx.measureText(word).width <= maxWidth) {
    return [word];
  }

  const parts: string[] = [];
  let current = "";

  Array.from(word).forEach((char) => {
    const next = `${current}${char}`;

    if (!current || ctx.measureText(next).width <= maxWidth) {
      current = next;
      return;
    }

    parts.push(current);
    current = char;
  });

  if (current) {
    parts.push(current);
  }

  return parts;
}

function getCanvasContext(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(i18n.global.t("qr.canvasUnavailable"));
  }

  return ctx;
}

function getCssColor(variableName: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

async function dataUrlToBytes(dataUrl: string) {
  const response = await fetch(dataUrl);
  return new Uint8Array(await response.arrayBuffer());
}
