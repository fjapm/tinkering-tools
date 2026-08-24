"use client";

import Link from "next/link";
import { InfoIcon } from "lucide-react";

import { AboutContent } from "@/components/about-content";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AboutDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <InfoIcon />
          About
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>How to build an org chart</SheetTitle>
          <SheetDescription>
            This org chart generator turns a small text file into a finished
            organizational chart. Write down who reports to whom, and the layout,
            spacing and connectors are worked out for you.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <AboutContent />
          <p className="mt-8 text-sm text-muted-foreground">
            <Link href="/about" className="font-medium text-foreground underline underline-offset-4">
              Open the full guide
            </Link>{" "}
            to link or bookmark it.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
