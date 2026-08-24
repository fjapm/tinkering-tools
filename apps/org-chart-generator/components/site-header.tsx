"use client";

import Link from "next/link";
import { MenuIcon, NetworkIcon } from "lucide-react";

import { AboutDrawer } from "@/components/about-drawer";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * The brand doubles as the page's h1 on the home page, where the app itself is
 * the content. On pages that have their own heading it drops back to a link.
 */
export function SiteHeader({
  brandAs,
  editorOpen,
  onOpenEditor,
}: {
  brandAs: "heading" | "link";
  editorOpen?: boolean;
  onOpenEditor?: () => void;
}) {
  const brand = (
    <span className="flex items-center gap-2">
      <NetworkIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      {/*
        Name and tagline share one span so the heading reads as a single
        sentence to screen readers and crawlers, rather than two spans the flex
        gap happens to separate. There is no room for the tagline on phones.
      */}
      <span className="truncate">
        {SITE_NAME}
        <span className="hidden font-normal text-muted-foreground lg:inline">
          {` — ${SITE_TAGLINE.toLowerCase()}`}
        </span>
      </span>
    </span>
  );

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-1">
        {onOpenEditor && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open the editor"
            aria-expanded={editorOpen}
            onClick={onOpenEditor}
          >
            <MenuIcon />
          </Button>
        )}
        {brandAs === "heading" ? (
          <h1 className="min-w-0 text-sm font-semibold">{brand}</h1>
        ) : (
          <Link href="/" className="min-w-0 text-sm font-semibold">
            {brand}
          </Link>
        )}
      </div>
      <AboutDrawer />
    </header>
  );
}
