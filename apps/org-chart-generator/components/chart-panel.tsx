"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  FileImageIcon,
  FileTextIcon,
  FileCodeIcon,
  InfoIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PAPER,
  downloadPdf,
  downloadPng,
  downloadSvg,
  PAPER_SIZES,
  type PaperSize,
} from "@/lib/org-chart/export";
import type { RenderedChart } from "@/lib/org-chart/render";

type Format = "svg" | "png" | "pdf";

export function ChartPanel({ chart, error }: { chart: RenderedChart | null; error: string | null }) {
  const [busy, setBusy] = useState<Format | null>(null);
  const [paper, setPaper] = useState<PaperSize>(DEFAULT_PAPER);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportWarning, setExportWarning] = useState<string | null>(null);

  async function exportAs(format: Format) {
    if (!chart) return;
    setBusy(format);
    setExportError(null);
    setExportWarning(null);
    try {
      // Not a lookup table any more: only the PDF exporter takes an option.
      const { warning } = await (format === "svg"
        ? downloadSvg(chart)
        : format === "png"
          ? downloadPng(chart)
          : downloadPdf(chart, paper));
      setExportWarning(warning);
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-2 sm:px-4">
        <span className="truncate text-sm font-medium">Preview</span>
        {/* Labels drop away on narrow screens so all three still fit. */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" disabled={!chart || busy !== null} onClick={() => exportAs("svg")}>
            <FileCodeIcon />
            <span className="max-sm:hidden">SVG</span>
          </Button>
          <Button variant="outline" size="sm" disabled={!chart || busy !== null} onClick={() => exportAs("png")}>
            <FileImageIcon />
            <span className="max-sm:hidden">{busy === "png" ? "Exporting…" : "PNG"}</span>
          </Button>
          {/* Sits next to the PDF button because it only affects that export. */}
          <Select value={paper} onValueChange={(value) => setPaper(value as PaperSize)}>
            <SelectTrigger size="sm" aria-label="PDF paper size" className="w-auto min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAPER_SIZES).map(([id, sheet]) => (
                <SelectItem key={id} value={id}>
                  {sheet.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" disabled={!chart || busy !== null} onClick={() => exportAs("pdf")}>
            <FileTextIcon />
            <span className="max-sm:hidden">{busy === "pdf" ? "Exporting…" : "PDF"}</span>
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-4 sm:p-6">
        {(error ?? exportError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangleIcon />
            <AlertTitle>{error ? "Could not generate the chart" : "Export failed"}</AlertTitle>
            <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
              {error ?? exportError}
            </AlertDescription>
          </Alert>
        )}

        {exportWarning && (
          <Alert className="mb-4">
            <InfoIcon />
            <AlertTitle>Export finished with a caveat</AlertTitle>
            <AlertDescription>{exportWarning}</AlertDescription>
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
