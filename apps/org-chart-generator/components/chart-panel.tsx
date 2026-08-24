"use client";

import { useState } from "react";
import { AlertTriangleIcon, FileImageIcon, FileTextIcon, FileCodeIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { downloadPdf, downloadPng, downloadSvg } from "@/lib/org-chart/export";
import type { RenderedChart } from "@/lib/org-chart/render";

type Format = "svg" | "png" | "pdf";

const EXPORTERS: Record<Format, (chart: RenderedChart) => void | Promise<void>> = {
  svg: downloadSvg,
  png: downloadPng,
  pdf: downloadPdf,
};

export function ChartPanel({ chart, error }: { chart: RenderedChart | null; error: string | null }) {
  const [busy, setBusy] = useState<Format | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  async function exportAs(format: Format) {
    if (!chart) return;
    setBusy(format);
    setExportError(null);
    try {
      await EXPORTERS[format](chart);
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b px-4">
        <span className="text-sm font-medium">Preview</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!chart || busy !== null} onClick={() => exportAs("svg")}>
            <FileCodeIcon />
            SVG
          </Button>
          <Button variant="outline" size="sm" disabled={!chart || busy !== null} onClick={() => exportAs("png")}>
            <FileImageIcon />
            {busy === "png" ? "Exporting…" : "PNG"}
          </Button>
          <Button variant="outline" size="sm" disabled={!chart || busy !== null} onClick={() => exportAs("pdf")}>
            <FileTextIcon />
            {busy === "pdf" ? "Exporting…" : "PDF"}
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-6">
        {(error ?? exportError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangleIcon />
            <AlertTitle>{error ? "Could not generate the chart" : "Export failed"}</AlertTitle>
            <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
              {error ?? exportError}
            </AlertDescription>
          </Alert>
        )}

        {chart && (
          <div
            className="mx-auto w-fit rounded-lg border bg-white shadow-sm [&>svg]:block [&>svg]:h-auto [&>svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: chart.svg }}
          />
        )}
      </div>
    </section>
  );
}
