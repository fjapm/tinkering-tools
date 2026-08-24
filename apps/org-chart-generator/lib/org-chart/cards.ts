import {
  attributeLine,
  escapeXml,
  ellipsize,
  headerColor,
  initials,
  INK,
  measureText,
  nodeId,
  STROKE,
  SUBTLE,
  trackedWidth,
  wrapText,
} from "./svg";
import type { LayoutOptions, OrgNode } from "./types";

/**
 * A card style, measured once for the whole chart and then stamped out per
 * person. Every card in a chart is the same size so rows stay aligned and the
 * tidy tree keeps working, which is why measuring takes the full node list.
 */
export type PreparedCard = {
  width: number;
  height: number;
  /** Artwork that reaches above the card's top edge, e.g. an avatar that straddles it. */
  overhang: number;
  render(node: OrgNode, x: number, y: number): string;
};

export type CardStyle = (all: OrgNode[], layout: LayoutOptions) => PreparedCard;

// ── basic ──────────────────────────────────────────────────────────────────
// Coloured title band over a white body: name, optional avatar, optional
// "phone · email" subtitle.

const TITLE_H = 24;
const NAME_H = 28;
const NODE_PAD = 11;
const MIN_NODE_W = 140;
const MAX_NODE_W = 260;
/** Contact lines and avatars need more room than a bare title + name. */
const MAX_CARD_W = 340;

const TITLE_SIZE = 10;
const TITLE_TRACKING = 0.6;
const NAME_SIZE = 11.5;
const ATTR_SIZE = 9;
const NAME_LINE = 14;
const ATTR_LINE = 11;
const ATTR_LINE_GAP = 2;
const BODY_PAD_Y = 9;
const BODY_PAD_X = 10;
const AVATAR = 34;
const AVATAR_GAP = 9;
const INITIALS_SIZE = 12;

/**
 * Initials circle first, headshot clipped on top. When the image cannot load —
 * a bad URL in the preview, or a host that blocks the cross-origin fetch the
 * exporters need — the initials underneath simply show through.
 */
function basicAvatar(node: OrgNode, x: number, bodyTop: number, bodyH: number, fill: string): string {
  const cx = x + BODY_PAD_X + AVATAR / 2;
  const cy = bodyTop + bodyH / 2;
  const r = AVATAR / 2;
  const clipId = `headshot-${nodeId(node)}`;
  const href = node.headshot ? escapeXml(node.headshot) : "";

  return [
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`,
    `<text x="${cx}" y="${cy + INITIALS_SIZE * 0.35}" text-anchor="middle" font-size="${INITIALS_SIZE}" font-weight="700" fill="${INK}">${escapeXml(initials(node.name))}</text>`,
    node.headshot
      ? `<clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` +
        `<image clip-path="url(#${clipId})" x="${cx - r}" y="${cy - r}" width="${AVATAR}" height="${AVATAR}" preserveAspectRatio="xMidYMid slice" href="${href}" xlink:href="${href}"/>`
      : "",
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${STROKE}" stroke-width="1"/>`,
  ].join("");
}

export const basicCard: CardStyle = (all, layout) => {
  const hasAvatar = all.some((node) => Boolean(node.headshot));
  const hasAttrs = all.some((node) => attributeLine(node) !== "");
  const bodyChrome = hasAvatar ? BODY_PAD_X * 2 + AVATAR + AVATAR_GAP : NODE_PAD * 2;

  const content = all.reduce((max, node) => {
    const attrs = attributeLine(node);
    return Math.max(
      max,
      trackedWidth(node.title.toUpperCase(), TITLE_SIZE, TITLE_TRACKING) + NODE_PAD * 2,
      measureText(node.name, NAME_SIZE) + bodyChrome,
      attrs ? measureText(attrs, ATTR_SIZE) + bodyChrome : 0,
    );
  }, 0);

  const maxWidth = hasAvatar || hasAttrs ? MAX_CARD_W : MAX_NODE_W;
  const width = Math.round(Math.min(maxWidth, Math.max(MIN_NODE_W, content)));

  const textBlock = NAME_LINE + (hasAttrs ? ATTR_LINE_GAP + ATTR_LINE : 0);
  let bodyH = NAME_H;
  if (hasAvatar) bodyH = Math.max(AVATAR + BODY_PAD_Y * 2, textBlock + BODY_PAD_Y * 2);
  else if (hasAttrs) bodyH = textBlock + BODY_PAD_Y * 2;

  const textInset = hasAvatar ? BODY_PAD_X + AVATAR + AVATAR_GAP : NODE_PAD;
  const textWidth = width - textInset - (hasAvatar ? BODY_PAD_X : NODE_PAD);

  return {
    width,
    height: TITLE_H + bodyH,
    overhang: 0,
    render(node, x, y) {
      const centerX = x + width / 2;
      const titleWidth = width - NODE_PAD * 2;

      const title = node.title.toUpperCase();
      const titleFits =
        trackedWidth(title, TITLE_SIZE, TITLE_TRACKING) <= titleWidth
          ? title
          : ellipsize(title, titleWidth, TITLE_SIZE, true);

      const bodyTop = y + TITLE_H;
      const bodyCenter = bodyTop + bodyH / 2;
      const nameCenterY = hasAttrs ? bodyCenter - textBlock / 2 + NAME_LINE / 2 : bodyCenter;
      const attrCenterY = bodyCenter + textBlock / 2 - ATTR_LINE / 2;

      const textX = hasAvatar ? x + textInset : centerX;
      const anchor = hasAvatar ? "start" : "middle";
      const attrs = attributeLine(node);
      const fill = headerColor(node, layout);

      return [
        `<g>`,
        `<rect x="${x}" y="${y}" width="${width}" height="${TITLE_H}" fill="${fill}" stroke="${STROKE}" stroke-width="1"/>`,
        `<text x="${centerX}" y="${y + TITLE_H / 2 + TITLE_SIZE * 0.35}" text-anchor="middle" font-size="${TITLE_SIZE}" font-weight="700" letter-spacing="${TITLE_TRACKING}" fill="${INK}">${escapeXml(titleFits)}</text>`,
        `<rect x="${x}" y="${bodyTop}" width="${width}" height="${bodyH}" fill="#ffffff" stroke="${STROKE}" stroke-width="1"/>`,
        hasAvatar ? basicAvatar(node, x, bodyTop, bodyH, fill) : "",
        `<text x="${textX}" y="${nameCenterY + NAME_SIZE * 0.35}" text-anchor="${anchor}" font-size="${NAME_SIZE}" fill="${INK}">${escapeXml(ellipsize(node.name, textWidth, NAME_SIZE, false))}</text>`,
        attrs
          ? `<text x="${textX}" y="${attrCenterY + ATTR_SIZE * 0.35}" text-anchor="${anchor}" font-size="${ATTR_SIZE}" fill="${SUBTLE}">${escapeXml(ellipsize(attrs, textWidth, ATTR_SIZE, false))}</text>`
          : ""
        ,
        `</g>`,
      ].join("");
    },
  };
};

// ── linkedin ───────────────────────────────────────────────────────────────
// Profile card: a coloured accent bar with the avatar straddling it, the
// LinkedIn badge in the corner, then the name and a wrapping role. The whole
// card is a link to the person's profile.

const LI_BAR_H = 9;
const LI_AVATAR_R = 21;
const LI_RING = 2;
const LI_BADGE = 15;
const LI_BADGE_TEXT = 8.5;
const LI_PAD_X = 12;
const LI_PAD_BOTTOM = 8;
const LI_NAME_SIZE = 11;
const LI_NAME_LINE = 14;
const LI_ROLE_SIZE = 9;
const LI_ROLE_LINE = 11.5;
const LI_ROLE_MAX_LINES = 2;
const LI_ATTR_SIZE = 8.5;
const LI_ATTR_LINE = 10.5;
const LI_AVATAR_GAP = 7;
const LI_MIN_W = 152;
const LI_MAX_W = 212;
const LI_RADIUS = 7;
const LI_BORDER = "#e3e8ef";
const LI_ROLE_INK = "#5b6675";
const LI_BADGE_BLUE = "#0a66c2";

const LI_AVATAR_CY = LI_BAR_H / 2;
const LI_AVATAR_BOTTOM = LI_AVATAR_CY + LI_AVATAR_R;

function linkedinAvatar(node: OrgNode, cx: number, cy: number, fill: string): string {
  const clipId = `li-headshot-${nodeId(node)}`;
  const href = node.headshot ? escapeXml(node.headshot) : "";
  const size = LI_AVATAR_R * 2;

  return [
    // White ring, so the avatar reads as sitting on top of the accent bar.
    `<circle cx="${cx}" cy="${cy}" r="${LI_AVATAR_R + LI_RING}" fill="#ffffff"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${LI_AVATAR_R}" fill="${fill}"/>`,
    `<text x="${cx}" y="${cy + 14 * 0.35}" text-anchor="middle" font-size="14" font-weight="700" fill="${INK}">${escapeXml(initials(node.name))}</text>`,
    node.headshot
      ? `<clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${LI_AVATAR_R}"/></clipPath>` +
        `<image clip-path="url(#${clipId})" x="${cx - LI_AVATAR_R}" y="${cy - LI_AVATAR_R}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" href="${href}" xlink:href="${href}"/>`
      : "",
    `<circle cx="${cx}" cy="${cy}" r="${LI_AVATAR_R}" fill="none" stroke="${LI_BORDER}" stroke-width="1"/>`,
  ].join("");
}

function linkedinBadge(x: number, y: number, width: number): string {
  const bx = x + width - LI_PAD_X - LI_BADGE;
  const by = y + LI_BAR_H - LI_BADGE / 2;
  return [
    `<rect x="${bx}" y="${by}" width="${LI_BADGE}" height="${LI_BADGE}" rx="3" fill="${LI_BADGE_BLUE}"/>`,
    `<text x="${bx + LI_BADGE / 2}" y="${by + LI_BADGE / 2 + LI_BADGE_TEXT * 0.36}" text-anchor="middle" font-size="${LI_BADGE_TEXT}" font-weight="700" fill="#ffffff">in</text>`,
  ].join("");
}

export const linkedinCard: CardStyle = (all, layout) => {
  const hasAttrs = all.some((node) => attributeLine(node) !== "");

  const content = all.reduce(
    (max, node) => Math.max(max, measureText(node.name, LI_NAME_SIZE, true) + LI_PAD_X * 2),
    0,
  );
  const width = Math.round(Math.min(LI_MAX_W, Math.max(LI_MIN_W, content)));
  const textWidth = width - LI_PAD_X * 2;

  // One uniform card height, so the role block is as tall as the wordiest role.
  const roleLines = all.reduce(
    (max, node) => Math.max(max, wrapText(node.title, textWidth, LI_ROLE_SIZE, LI_ROLE_MAX_LINES).length),
    1,
  );

  const height = Math.round(
    LI_AVATAR_BOTTOM +
      LI_AVATAR_GAP +
      LI_NAME_LINE +
      roleLines * LI_ROLE_LINE +
      (hasAttrs ? LI_ATTR_LINE : 0) +
      LI_PAD_BOTTOM,
  );

  return {
    width,
    height,
    overhang: LI_AVATAR_R + LI_RING - LI_AVATAR_CY,
    render(node, x, y) {
      const centerX = x + width / 2;
      const clipId = `li-card-${nodeId(node)}`;
      const fill = headerColor(node, layout);
      const attrs = attributeLine(node);

      const nameBaseline = y + LI_AVATAR_BOTTOM + LI_AVATAR_GAP + LI_NAME_SIZE;
      const roles = wrapText(node.title, textWidth, LI_ROLE_SIZE, LI_ROLE_MAX_LINES);

      const body = [
        `<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LI_RADIUS}"/></clipPath>`,
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LI_RADIUS}" fill="#ffffff" stroke="${LI_BORDER}" stroke-width="1"/>`,
        `<rect clip-path="url(#${clipId})" x="${x}" y="${y}" width="${width}" height="${LI_BAR_H}" fill="${fill}"/>`,
        node.linkedin ? linkedinBadge(x, y, width) : "",
        linkedinAvatar(node, centerX, y + LI_AVATAR_CY, fill),
        `<text x="${centerX}" y="${nameBaseline}" text-anchor="middle" font-size="${LI_NAME_SIZE}" font-weight="700" fill="${INK}">${escapeXml(ellipsize(node.name, textWidth, LI_NAME_SIZE, true))}</text>`,
        roles
          .map(
            (line, index) =>
              `<text x="${centerX}" y="${nameBaseline + LI_ROLE_LINE * (index + 1)}" text-anchor="middle" font-size="${LI_ROLE_SIZE}" fill="${LI_ROLE_INK}">${escapeXml(line)}</text>`,
          )
          .join(""),
        attrs
          ? `<text x="${centerX}" y="${nameBaseline + LI_ROLE_LINE * roleLines + LI_ATTR_LINE}" text-anchor="middle" font-size="${LI_ATTR_SIZE}" fill="${SUBTLE}">${escapeXml(ellipsize(attrs, textWidth, LI_ATTR_SIZE, false))}</text>`
          : "",
      ].join("");

      // parse.ts has already normalised and vetted the URL scheme.
      if (!node.linkedin) return `<g>${body}</g>`;
      const href = escapeXml(node.linkedin);
      return (
        `<a href="${href}" xlink:href="${href}" target="_blank" rel="noopener noreferrer" style="cursor:pointer">` +
        `<title>${escapeXml(node.name)} on LinkedIn</title>${body}</a>`
      );
    },
  };
};

export const CARD_STYLES: Record<string, CardStyle> = {
  basic: basicCard,
  linkedin: linkedinCard,
};
