import type { RenderedChart } from "./render";

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadSvg(chart: RenderedChart, filename = "org-chart.svg") {
  save(new Blob([chart.svg], { type: "image/svg+xml;charset=utf-8" }), filename);
}

async function rasterize(chart: RenderedChart, scale: number): Promise<Blob> {
  const source = URL.createObjectURL(
    new Blob([chart.svg], { type: "image/svg+xml;charset=utf-8" }),
  );
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

export function renderPng(chart: RenderedChart): Promise<Blob> {
  return rasterize(chart, 2);
}

export async function renderPdf(chart: RenderedChart): Promise<Blob> {
  const [{ jsPDF }] = await Promise.all([import("jspdf"), import("svg2pdf.js")]);

  // svg2pdf reads computed styles, so the element has to be in the live
  // document — park it offscreen for the duration of the conversion.
  const element = new DOMParser().parseFromString(chart.svg, "image/svg+xml").documentElement;
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;opacity:0;pointer-events:none";
  host.appendChild(element);
  document.body.appendChild(host);

  try {
    const pdf = new jsPDF({
      orientation: chart.width >= chart.height ? "landscape" : "portrait",
      unit: "pt",
      format: [chart.width, chart.height],
    });
    await pdf.svg(element, { width: chart.width, height: chart.height });
    return pdf.output("blob");
  } finally {
    host.remove();
  }
}

export async function downloadPng(chart: RenderedChart, filename = "org-chart.png") {
  save(await renderPng(chart), filename);
}

export async function downloadPdf(chart: RenderedChart, filename = "org-chart.pdf") {
  save(await renderPdf(chart), filename);
}
