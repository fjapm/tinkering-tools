import type { Metadata } from "next";
import Link from "next/link";

import { AboutContent } from "@/components/about-content";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { Button } from "@/components/ui/button";
import { FAQ, STEPS } from "@/lib/about";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "How to Build an Org Chart";
const DESCRIPTION =
  "A short guide to building an org chart with this organizational chart generator: describe reporting lines in a plain text file, pick a layout, add headshots and contact details, then export to SVG, PNG or PDF.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "article",
    url: "/about",
    title: `${TITLE} — ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

const HOW_TO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: TITLE,
  description: DESCRIPTION,
  url: `${SITE_URL}/about`,
  totalTime: "PT10M",
  tool: [{ "@type": "HowToTool", name: SITE_NAME }],
  step: STEPS.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.title,
    text: step.body,
    url: `${SITE_URL}/about#step-${index + 1}`,
  })),
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: { "@type": "Answer", text: entry.answer },
  })),
};

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <StructuredData data={HOW_TO_SCHEMA} />
      <StructuredData data={FAQ_SCHEMA} />
      <SiteHeader brandAs="link" />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <article>
          <h1 className="text-3xl font-semibold tracking-tight">{TITLE}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            An org chart turns &ldquo;who reports to whom&rdquo; into a picture people can
            read at a glance. This org chart generator builds one from a small
            configuration file instead of a drag-and-drop canvas: you write down
            the reporting lines, and the spacing, alignment and connectors are
            worked out for you.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Because the chart is just text, it diffs and reviews like code. Keep
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-sm">chart.toml</code>
            in your repository and regenerate the chart whenever the team changes,
            rather than hunting for whoever still has the original design file.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Open the editor</Link>
            </Button>
          </div>

          <hr className="my-10" />

          <AboutContent headingLevel="h2" />
        </article>
      </main>

      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        <Link href="/" className="underline underline-offset-4">
          {SITE_NAME}
        </Link>
        {" — free organizational chart generator. No account required."}
      </footer>
    </div>
  );
}
