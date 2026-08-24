import type { LayoutOptions, OrgNode } from "./types";

const FONT_FAMILY = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const TITLE_H = 24;
const NAME_H = 28;
const NODE_H = TITLE_H + NAME_H;
const NODE_PAD = 11;
const MIN_NODE_W = 140;
const MAX_NODE_W = 260;

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
const TITLE_SIZE = 10;
const TITLE_TRACKING = 0.6;
const NAME_SIZE = 11.5;

const STROKE = "#1f2937";
const LINK = "#475569";
const INK = "#111827";
const SUBTLE = "#64748b";
const DEFAULT_HEADER = "#a9bef2";

const ROW_COLORS = [
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

function measureText(text: string, fontSize: number, bold = false): number {
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

function trackedWidth(text: string, fontSize: number, tracking: number): number {
  return measureText(text, fontSize, true) + Math.max(0, text.length - 1) * tracking;
}

function ellipsize(text: string, maxWidth: number, fontSize: number, bold: boolean): string {
  if (measureText(text, fontSize, bold) <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && measureText(`${clipped}…`, fontSize, bold) > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped.trimEnd()}…`;
}

function escapeXml(text: string): string {
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
function layoutTree(roots: OrgNode[], nodeWidth: number): Placed[] {
  let cursor = 0;

  const place = (node: OrgNode, depth: number): Placed => {
    const y = depth * (NODE_H + ROW_GAP);
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

function headerColor(node: OrgNode, layout: LayoutOptions): string {
  if (node.color) return node.color;
  if (!layout.colorDifferentRows) return DEFAULT_HEADER;
  return ROW_COLORS[node.depth % ROW_COLORS.length];
}

function renderNode(placed: Placed, layout: LayoutOptions, nodeWidth: number, offsetY: number): string {
  const { node, x } = placed;
  const y = placed.y + offsetY;
  const centerX = x + nodeWidth / 2;
  const inner = nodeWidth - NODE_PAD * 2;

  const title = node.title.toUpperCase();
  const titleFits =
    trackedWidth(title, TITLE_SIZE, TITLE_TRACKING) <= inner
      ? title
      : ellipsize(title, inner, TITLE_SIZE, true);

  return [
    `<g>`,
    `<rect x="${x}" y="${y}" width="${nodeWidth}" height="${TITLE_H}" fill="${headerColor(node, layout)}" stroke="${STROKE}" stroke-width="1"/>`,
    `<text x="${centerX}" y="${y + TITLE_H / 2 + TITLE_SIZE * 0.35}" text-anchor="middle" font-size="${TITLE_SIZE}" font-weight="700" letter-spacing="${TITLE_TRACKING}" fill="${INK}">${escapeXml(titleFits)}</text>`,
    `<rect x="${x}" y="${y + TITLE_H}" width="${nodeWidth}" height="${NAME_H}" fill="#ffffff" stroke="${STROKE}" stroke-width="1"/>`,
    `<text x="${centerX}" y="${y + TITLE_H + NAME_H / 2 + NAME_SIZE * 0.35}" text-anchor="middle" font-size="${NAME_SIZE}" fill="${INK}">${escapeXml(ellipsize(node.name, inner, NAME_SIZE, false))}</text>`,
    `</g>`,
  ].join("");
}

function arrowHead(x: number, y: number): string {
  return `<path d="M${x - 4} ${y - 6} L${x + 4} ${y - 6} L${x} ${y} Z" fill="${LINK}"/>`;
}

function renderLinks(placed: Placed, nodeWidth: number, offsetY: number): string {
  if (placed.children.length === 0) return "";

  const centerX = placed.x + nodeWidth / 2;
  const bottom = placed.y + offsetY + NODE_H;
  const childTop = placed.children[0].y + offsetY;
  const busY = bottom + ROW_GAP / 2;
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${LINK}" stroke-width="1.2" fill="none"/>`;

  const parts: string[] = [];

  if (placed.children.length === 1) {
    parts.push(line(centerX, bottom, centerX, childTop - 6));
    parts.push(arrowHead(centerX, childTop));
  } else {
    const centers = placed.children.map((child) => child.x + nodeWidth / 2);
    parts.push(line(centerX, bottom, centerX, busY));
    parts.push(line(Math.min(...centers), busY, Math.max(...centers), busY));
    for (const x of centers) {
      parts.push(line(x, busY, x, childTop - 6));
      parts.push(arrowHead(x, childTop));
    }
  }

  return parts.join("") + placed.children.map((child) => renderLinks(child, nodeWidth, offsetY)).join("");
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

  const widest = all.reduce((max, node) => {
    const title = trackedWidth(node.title.toUpperCase(), TITLE_SIZE, TITLE_TRACKING);
    const name = measureText(node.name, NAME_SIZE);
    return Math.max(max, title, name);
  }, 0);
  const nodeWidth = Math.round(
    Math.min(MAX_NODE_W, Math.max(MIN_NODE_W, widest + NODE_PAD * 2)),
  );

  const placed = layoutTree(roots, nodeWidth);
  const flat = flatten(placed);
  const chartWidth = Math.max(...flat.map((item) => item.x)) + nodeWidth;
  const chartHeight = Math.max(...flat.map((item) => item.y)) + NODE_H;

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
  const offsetY = headingBlock;
  const footnoteY = PAD_Y + headingBlock + chartHeight + FOOTNOTE_GAP + FOOTNOTE_SIZE * 0.8;

  const centered = (text: string, y: number, size: number, weight: number, fill: string, tracking: number) =>
    `<text x="${width / 2}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${weight}" letter-spacing="${tracking}" fill="${fill}">${escapeXml(text)}</text>`;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT_FAMILY}">`,
    layout.bgColor === "transparent"
      ? ""
      : `<rect width="${width}" height="${height}" fill="${escapeXml(layout.bgColor)}"/>`,
    layout.title ? centered(layout.title.toUpperCase(), titleY, HEADING_SIZE, 700, INK, 1) : "",
    layout.subTitle ? centered(layout.subTitle, subTitleY, SUBTITLE_SIZE, 400, SUBTLE, 0.2) : "",
    `<g transform="translate(${offsetX}, ${PAD_Y})">`,
    placed.map((item) => renderLinks(item, nodeWidth, offsetY)).join(""),
    flat.map((item) => renderNode(item, layout, nodeWidth, offsetY)).join(""),
    `</g>`,
    layout.footnote ? centered(layout.footnote, footnoteY, FOOTNOTE_SIZE, 400, SUBTLE, 0.2) : "",
    `</svg>`,
  ].join("");

  return { svg, width, height };
}
