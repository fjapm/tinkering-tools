"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { ChartPanel } from "@/components/chart-panel";
import { parseOrgChart } from "@/lib/org-chart/parse";
import { renderOrgChart, type RenderedChart } from "@/lib/org-chart/render";
import { SAMPLE_TOML } from "@/lib/org-chart/sample";

const TomlEditor = dynamic(() => import("@/components/toml-editor"), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse bg-muted/40" />,
});

type Preview = { chart: RenderedChart | null; error: string | null };

/** Falls back to the last chart that parsed, so a half-typed line doesn't blank the preview. */
function generate(source: string, previous: RenderedChart | null): Preview {
  const parsed = parseOrgChart(source);
  if (!parsed.ok) {
    return { chart: previous, error: parsed.error };
  }
  return { chart: renderOrgChart(parsed.roots, parsed.layout), error: null };
}

export default function Page() {
  const [source, setSource] = useState(SAMPLE_TOML);
  const [preview, setPreview] = useState<Preview>(() => generate(SAMPLE_TOML, null));

  function handleChange(next: string) {
    setSource(next);
    setPreview((current) => generate(next, current.chart));
  }

  return (
    <main className="grid h-dvh grid-cols-[25%_75%] grid-rows-[minmax(0,1fr)] overflow-hidden">
      <section className="flex min-h-0 min-w-0 flex-col border-r">
        <header className="flex h-12 shrink-0 items-center border-b px-4">
          <span className="text-sm font-medium">chart.toml</span>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          <TomlEditor value={source} onChange={handleChange} />
        </div>
      </section>

      <ChartPanel chart={preview.chart} error={preview.error} />
    </main>
  );
}
