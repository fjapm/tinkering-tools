"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { XIcon } from "lucide-react";

import { ChartPanel } from "@/components/chart-panel";
import { SiteHeader } from "@/components/site-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseOrgChart } from "@/lib/org-chart/parse";
import { renderOrgChart, type RenderedChart } from "@/lib/org-chart/render";
import { DEFAULT_TEMPLATE, TEMPLATES, type Template } from "@/lib/org-chart/templates";
import { cn } from "@/lib/utils";

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

export function OrgChartStudio() {
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE.id);
  const [source, setSource] = useState(DEFAULT_TEMPLATE.toml);
  const [preview, setPreview] = useState<Preview>(() => generate(DEFAULT_TEMPLATE.toml, null));
  const [editorOpen, setEditorOpen] = useState(false);
  /** Set while a template swap is waiting on the discard-changes confirmation. */
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);

  // Edited back to the pristine template? Then there is nothing to lose.
  const edited = source !== TEMPLATES.find((candidate) => candidate.id === templateId)?.toml;

  function handleChange(next: string) {
    setSource(next);
    setPreview((current) => generate(next, current.chart));
  }

  function applyTemplate(template: Template) {
    setPendingTemplate(null);
    setTemplateId(template.id);
    handleChange(template.toml);
  }

  function handleTemplate(id: string) {
    const template = TEMPLATES.find((candidate) => candidate.id === id);
    if (!template) return;
    // The Select stays controlled by templateId, so declining just snaps back.
    if (edited) {
      setPendingTemplate(template);
      return;
    }
    applyTemplate(template);
  }

  // A flat 25% column leaves the editor near 190px on a portrait tablet, where
  // every TOML line wraps — give it a bigger share until the screen is wide.
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader
        brandAs="heading"
        editorOpen={editorOpen}
        onOpenEditor={() => setEditorOpen(true)}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[38%_62%] lg:grid-cols-[25%_75%]">
        {editorOpen && (
          <button
            type="button"
            aria-label="Close the editor"
            onClick={() => setEditorOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        )}

        {/*
          One editor instance for both breakpoints: a slide-over below md, a grid
          column from md up. `invisible` — not just the off-screen transform —
          keeps the hidden editor out of the tab order, and still animates because
          CSS holds visibility until a transition finishes.
        */}
        <section
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex min-h-0 w-[85%] max-w-sm min-w-0 flex-col border-r bg-background shadow-xl transition-[transform,visibility] duration-200",
            "md:visible md:static md:z-auto md:w-auto md:max-w-none md:translate-x-0 md:shadow-none",
            editorOpen ? "visible translate-x-0" : "invisible -translate-x-full",
          )}
        >
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 overflow-hidden border-b px-4">
            <span className="shrink-0 text-sm font-medium">chart.toml</span>
            {/* min-w-0 lets the trigger shrink and truncate instead of overflowing. */}
            <div className="flex min-w-0 items-center gap-1">
              <Select value={templateId} onValueChange={handleTemplate}>
                <SelectTrigger size="sm" aria-label="Template" className="min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Close the editor"
                onClick={() => setEditorOpen(false)}
              >
                <XIcon />
              </Button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-hidden">
            <TomlEditor value={source} onChange={handleChange} />
          </div>
        </section>

        <ChartPanel chart={preview.chart} error={preview.error} />
      </main>

      <AlertDialog
        open={pendingTemplate !== null}
        onOpenChange={(open) => !open && setPendingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have edited chart.toml. Loading &ldquo;{pendingTemplate?.label}&rdquo; replaces
              everything in the editor, and this cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingTemplate && applyTemplate(pendingTemplate)}>
              Load template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
