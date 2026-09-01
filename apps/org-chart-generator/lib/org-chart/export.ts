import type { RenderedChart } from "./render";

const XLINK_NS = "http://www.w3.org/1999/xlink";

/** A completed export, plus anything the user should know about it. */
export type ExportResult = { warning: string | null };

/** Portrait point dimensions. The PDF exporter turns the sheet for wide charts. */
export const PAPER_SIZES = {
  a4: { label: "A4", width: 595.28, height: 841.89 },
  letter: { label: "Letter", width: 612, height: 792 },
} as const;

export type PaperSize = keyof typeof PAPER_SIZES;

export const DEFAULT_PAPER: PaperSize = "a4";

/** Keeps the chart off the unprintable strip at the edge of a sheet. */
const PAGE_MARGIN = 24;

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readAsDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(blob);
  });
}

function imageHref(image: Element): string | null {
  return image.getAttribute("href") ?? image.getAttributeNS(XLINK_NS, "href");
}

/**
 * Neither the canvas rasterizer nor svg2pdf can pull in an external image, so
 * every headshot and flag has to be embedded as a data: URI first. Hosts that
 * don't send CORS headers will refuse the fetch — drop those images so whatever
 * the renderer drew underneath shows through, and report how many were lost.
 */
async function embedImages(svg: string): Promise<{ svg: string; dropped: number }> {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const images = Array.from(document.querySelectorAll("image"));
  if (images.length === 0) return { svg, dropped: 0 };

  let dropped = 0;
  await Promise.all(
    images.map(async (image) => {
      const href = imageHref(image);
      if (href?.startsWith("data:")) return;
      try {
        if (!href) throw new Error("Missing image reference.");
        const response = await fetch(href);
        if (!response.ok) throw new Error(`Request failed with ${response.status}.`);
        const data = await readAsDataUri(await response.blob());
        image.setAttribute("href", data);
        image.setAttributeNS(XLINK_NS, "xlink:href", data);
      } catch {
        image.remove();
        dropped += 1;
      }
    }),
  );

  return { svg: new XMLSerializer().serializeToString(document), dropped };
}

function droppedWarning(dropped: number): string | null {
  if (dropped === 0) return null;
  const subject = dropped === 1 ? "an image" : `${dropped} images`;
  return `Could not embed ${subject} — the image host has to allow cross-origin requests, or you can inline the picture as a data: URI. Headshots fall back to the person's initials.`;
}

export function downloadSvg(chart: RenderedChart, filename = "org-chart.svg"): ExportResult {
  // An SVG file is opened in a browser, which loads external images itself.
  save(new Blob([chart.svg], { type: "image/svg+xml;charset=utf-8" }), filename);
  return { warning: null };
}

async function rasterize(svg: string, chart: RenderedChart, scale: number): Promise<Blob> {
  const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not rasterize the chart."));
      image.src = source;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(chart.width * scale);
    canvas.height = Math.round(chart.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the PNG."))),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(source);
  }
}

export async function renderPng(chart: RenderedChart): Promise<{ blob: Blob; dropped: number }> {
  const { svg, dropped } = await embedImages(chart.svg);
  return { blob: await rasterize(svg, chart, 2), dropped };
}

/**
 * Fit the whole chart onto one sheet of the chosen paper, turned landscape when
 * the chart is wider than it is tall so the fitted scale is as large as it can
 * be. A chart much wider than a page still ends up small — that is the ratio,
 * not the fitting; SVG export is the way to keep it at full size.
 */
export async function renderPdf(
  chart: RenderedChart,
  paper: PaperSize = DEFAULT_PAPER,
): Promise<{ blob: Blob; dropped: number }> {
  const [{ jsPDF }] = await Promise.all([import("jspdf"), import("svg2pdf.js")]);
  const { svg, dropped } = await embedImages(chart.svg);

  // svg2pdf reads computed styles, so the element has to be in the live
  // document — park it offscreen for the duration of the conversion.
  const element = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;opacity:0;pointer-events:none";
  host.appendChild(element);
  document.body.appendChild(host);

  try {
    const sheet = PAPER_SIZES[paper];
    const landscape = chart.width >= chart.height;
    const pageWidth = landscape ? sheet.height : sheet.width;
    const pageHeight = landscape ? sheet.width : sheet.height;

    const pdf = new jsPDF({
      orientation: landscape ? "landscape" : "portrait",
      unit: "pt",
      // Always the portrait pair — jsPDF turns it itself to match the
      // orientation above, so passing pre-turned dimensions would undo it.
      format: [sheet.width, sheet.height],
    });

    const scale = Math.min(
      (pageWidth - PAGE_MARGIN * 2) / chart.width,
      (pageHeight - PAGE_MARGIN * 2) / chart.height,
    );
    const width = chart.width * scale;
    const height = chart.height * scale;

    await pdf.svg(element, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    });
    return { blob: pdf.output("blob"), dropped };
  } finally {
    host.remove();
  }
}

export async function downloadPng(chart: RenderedChart, filename = "org-chart.png"): Promise<ExportResult> {
  const { blob, dropped } = await renderPng(chart);
  save(blob, filename);
  return { warning: droppedWarning(dropped) };
}

export async function downloadPdf(
  chart: RenderedChart,
  paper: PaperSize = DEFAULT_PAPER,
  filename = "org-chart.pdf",
): Promise<ExportResult> {
  const { blob, dropped } = await renderPdf(chart, paper);
  save(blob, filename);
  return { warning: droppedWarning(dropped) };
}
