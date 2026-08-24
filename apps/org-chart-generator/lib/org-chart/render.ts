import { CARD_STYLES, type PreparedCard } from "./cards";
import {
  escapeXml,
  FONT_FAMILY,
  INK,
  LINK,
  measureText,
  SUBTLE,
  trackedWidth,
  XLINK_NS,
} from "./svg";
import type { LayoutOptions, OrgNode } from "./types";

const COL_GAP = 16;
const ROW_GAP = 42;
const PAD_X = 44;
const PAD_Y = 36;

const HEADING_SIZE = 30;
const HEADING_GAP = 44;
const SUBTITLE_SIZE = 13;
const SUBTITLE_GAP = 14;
const FOOTNOTE_SIZE = 10;
const FOOTNOTE_GAP = 26;

type Placed = {
  node: OrgNode;
  x: number;
  y: number;
  children: Placed[];
};

function flatten(placed: Placed[]): Placed[] {
  return placed.flatMap((item) => [item, ...flatten(item.children)]);
}

/**
 * Classic tidy tree: leaves take the next slot left to right, parents centre
 * over their children. Sibling subtrees never overlap because each one owns a
 * contiguous run of leaf slots and every parent sits inside its own run.
 */
function layoutTree(roots: OrgNode[], nodeWidth: number, rowPitch: number): Placed[] {
  let cursor = 0;

  const place = (node: OrgNode, depth: number): Placed => {
    const y = depth * rowPitch;
    const children = node.children.map((child) => place(child, depth + 1));

    if (children.length === 0) {
      const x = cursor;
      cursor += nodeWidth + COL_GAP;
      return { node, x, y, children };
    }

    const first = children[0];
    const last = children[children.length - 1];
    return { node, x: (first.x + last.x) / 2, y, children };
  };

  return roots.map((root) => place(root, 0));
}

function arrowHead(x: number, y: number): string {
  return `<path d="M${x - 4} ${y - 6} L${x + 4} ${y - 6} L${x} ${y} Z" fill="${LINK}"/>`;
}

/** Arrows stop at the top of a child's artwork, above any avatar overhang. */
function renderLinks(placed: Placed, card: PreparedCard, rowGap: number, offsetY: number): string {
  if (placed.children.length === 0) return "";

  const centerX = placed.x + card.width / 2;
  const bottom = placed.y + offsetY + card.height;
  const childTop = placed.children[0].y + offsetY - card.overhang;
  const busY = bottom + rowGap / 2;
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${LINK}" stroke-width="1.2" fill="none"/>`;

  const parts: string[] = [];

  if (placed.children.length === 1) {
    parts.push(line(centerX, bottom, centerX, childTop - 6));
    parts.push(arrowHead(centerX, childTop));
  } else {
    const centers = placed.children.map((child) => child.x + card.width / 2);
    parts.push(line(centerX, bottom, centerX, busY));
    parts.push(line(Math.min(...centers), busY, Math.max(...centers), busY));
    for (const x of centers) {
      parts.push(line(x, busY, x, childTop - 6));
      parts.push(arrowHead(x, childTop));
    }
  }

  return (
    parts.join("") +
    placed.children.map((child) => renderLinks(child, card, rowGap, offsetY)).join("")
  );
}

export type RenderedChart = {
  svg: string;
  width: number;
  height: number;
};

export function renderOrgChart(roots: OrgNode[], layout: LayoutOptions): RenderedChart {
  const all: OrgNode[] = [];
  const collect = (node: OrgNode) => {
    all.push(node);
    node.children.forEach(collect);
  };
  roots.forEach(collect);

  const card = (CARD_STYLES[layout.name] ?? CARD_STYLES.basic)(all, layout);

  // Widen the gap between rows so an overhanging avatar clears the arrow bus.
  const rowGap = ROW_GAP + card.overhang;
  const placed = layoutTree(roots, card.width, card.height + rowGap);
  const flat = flatten(placed);
  const chartWidth = Math.max(...flat.map((item) => item.x)) + card.width;
  const chartHeight = Math.max(...flat.map((item) => item.y)) + card.height + card.overhang;

  // Stack the optional heading rows above the tree and the footnote below it,
  // so the canvas only grows for the parts that are actually present.
  let headingBlock = 0;
  const titleY = PAD_Y + HEADING_SIZE * 0.8;
  if (layout.title) headingBlock += HEADING_SIZE;
  const subTitleY = PAD_Y + headingBlock + (headingBlock ? SUBTITLE_GAP : 0) + SUBTITLE_SIZE * 0.8;
  if (layout.subTitle) headingBlock += (headingBlock ? SUBTITLE_GAP : 0) + SUBTITLE_SIZE;
  if (headingBlock) headingBlock += HEADING_GAP;

  const footnoteBlock = layout.footnote ? FOOTNOTE_GAP + FOOTNOTE_SIZE : 0;

  // A long subtitle or footnote can outrun a narrow tree — widen the canvas to
  // fit it, then centre the tree in whatever width we end up with.
  const captionWidth = Math.max(
    layout.title ? trackedWidth(layout.title.toUpperCase(), HEADING_SIZE, 1) : 0,
    layout.subTitle ? measureText(layout.subTitle, SUBTITLE_SIZE) : 0,
    layout.footnote ? measureText(layout.footnote, FOOTNOTE_SIZE) : 0,
  );
  const width = Math.round(Math.max(chartWidth, captionWidth) + PAD_X * 2);
  const height = Math.round(chartHeight + headingBlock + footnoteBlock + PAD_Y * 2);
  const offsetX = Math.round((width - chartWidth) / 2);
  const offsetY = headingBlock + card.overhang;
  const footnoteY = PAD_Y + headingBlock + chartHeight + FOOTNOTE_GAP + FOOTNOTE_SIZE * 0.8;

  const centered = (text: string, y: number, size: number, weight: number, fill: string, tracking: number) =>
    `<text x="${width / 2}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${weight}" letter-spacing="${tracking}" fill="${fill}">${escapeXml(text)}</text>`;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XLINK_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT_FAMILY}">`,
    layout.bgColor === "transparent"
      ? ""
      : `<rect width="${width}" height="${height}" fill="${escapeXml(layout.bgColor)}"/>`,
    layout.title ? centered(layout.title.toUpperCase(), titleY, HEADING_SIZE, 700, INK, 1) : "",
    layout.subTitle ? centered(layout.subTitle, subTitleY, SUBTITLE_SIZE, 400, SUBTLE, 0.2) : "",
    `<g transform="translate(${offsetX}, ${PAD_Y})">`,
    placed.map((item) => renderLinks(item, card, rowGap, offsetY)).join(""),
    flat.map((item) => card.render(item.node, item.x, item.y + offsetY)).join(""),
    `</g>`,
    layout.footnote ? centered(layout.footnote, footnoteY, FOOTNOTE_SIZE, 400, SUBTLE, 0.2) : "",
    `</svg>`,
  ].join("");

  return { svg, width, height };
}
