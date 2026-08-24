import type { LayoutOptions, OrgNode } from "./types";

export const FONT_FAMILY = "'Helvetica Neue', Helvetica, Arial, sans-serif";
export const XLINK_NS = "http://www.w3.org/1999/xlink";

export const STROKE = "#1f2937";
export const LINK = "#475569";
export const INK = "#111827";
export const SUBTLE = "#64748b";
export const DEFAULT_HEADER = "#a9bef2";

export const ROW_COLORS = [
  "#a9bef2",
  "#a9d8f2",
  "#a4e3dc",
  "#bde5b4",
  "#f0e1a6",
  "#f2c4a9",
];

/**
 * Approximate Helvetica advance widths. Good enough to size boxes and decide
 * where to ellipsize without needing a canvas or a font metrics table.
 */
const NARROW = "iltjfIr.,:;'|!()[]{}-";
const WIDE = "MWmw@%";

export function measureText(text: string, fontSize: number, bold = false): number {
  let units = 0;
  for (const char of text) {
    if (char === " ") units += 0.28;
    else if (NARROW.includes(char)) units += 0.3;
    else if (WIDE.includes(char)) units += 0.9;
    else if (char >= "A" && char <= "Z") units += 0.68;
    else units += 0.55;
  }
  return units * fontSize * (bold ? 1.06 : 1);
}

export function trackedWidth(text: string, fontSize: number, tracking: number): number {
  return measureText(text, fontSize, true) + Math.max(0, text.length - 1) * tracking;
}

export function ellipsize(text: string, maxWidth: number, fontSize: number, bold: boolean): string {
  if (measureText(text, fontSize, bold) <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && measureText(`${clipped}…`, fontSize, bold) > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped.trimEnd()}…`;
}

/**
 * Greedy word wrap, capped at maxLines. Anything that doesn't fit is crammed
 * into the last line and ellipsized, so a long job title degrades instead of
 * silently disappearing.
 */
export function wrapText(text: string, maxWidth: number, fontSize: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (measureText(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);

  const fitted = lines.length <= maxLines
    ? lines
    : [...lines.slice(0, maxLines - 1), lines.slice(maxLines - 1).join(" ")];
  return fitted.map((line) => ellipsize(line, maxWidth, fontSize, false));
}

export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

/** The subtitle line under the name. Title is shown separately by every card. */
export function attributeLine(node: OrgNode): string {
  return [node.phone, node.email].filter(Boolean).join(" · ");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/** Per-person `color` wins, then the row colour, then the default. */
export function headerColor(node: OrgNode, layout: LayoutOptions): string {
  if (node.color) return node.color;
  if (!layout.colorDifferentRows) return DEFAULT_HEADER;
  return ROW_COLORS[node.depth % ROW_COLORS.length];
}

/** A unique, XML-safe id suffix for a node's clip paths. */
export function nodeId(node: OrgNode): string {
  return node.position.replace(/\./g, "-");
}
