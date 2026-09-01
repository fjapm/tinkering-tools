import { parse as parseToml } from "smol-toml";

import type { LayoutOptions, OrgNode, ParseResult, Person } from "./types";

const BARE_WORD = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const RESERVED = new Set(["true", "false", "inf", "nan"]);
const DOTTED_NUMBER = /^[0-9]+(?:\.[0-9]+)*$/;
const KEY_VALUE = /^(\s*)([A-Za-z0-9_-]+)(\s*=\s*)(.*?)(\s*(?:#.*)?)$/;
const SUPPORTED_LAYOUTS = new Set(["basic", "linkedin"]);
const LINKEDIN_HOST = /^[\w.-]*linkedin\.com\//i;
const LINKEDIN_HANDLE = /^[\w.-]+$/;
const COUNTRY_CODE = /^[A-Za-z]{2}$/;
const DEFAULT_BG_COLOR = "#f7faff";

/**
 * Accept the relaxed TOML people naturally write for org charts and turn it
 * into strict TOML. Three fixups, all conservative — a line is only rewritten
 * when it matches exactly, so anything already valid is passed through as-is.
 *
 *   [person]        -> [[person]]   repeated tables must be an array of tables
 *   position = 1.1  -> "1.1"        1.1.2 isn't a number, and 1.10 == 1.1
 *   name = basic    -> "basic"      bare words aren't TOML strings
 */
export function normalizeToml(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      if (/^\s*\[person\]\s*$/.test(line)) {
        return line.replace("[person]", "[[person]]");
      }

      const match = KEY_VALUE.exec(line);
      if (!match) return line;
      const [, indent, key, equals, value, trailing] = match;

      if (key === "position" && DOTTED_NUMBER.test(value)) {
        return `${indent}${key}${equals}"${value}"${trailing}`;
      }
      if (BARE_WORD.test(value) && !RESERVED.has(value)) {
        return `${indent}${key}${equals}"${value}"${trailing}`;
      }
      return line;
    })
    .join("\n");
}

function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

/** Sort "1.10" after "1.2" by comparing segments numerically. */
function comparePositions(a: string, b: string): number {
  const left = a.split(".");
  const right = b.split(".");
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const l = Number(left[i] ?? -1);
    const r = Number(right[i] ?? -1);
    if (l !== r) return l - r;
  }
  return 0;
}

function readLayout(raw: unknown): LayoutOptions {
  const table = (raw ?? {}) as Record<string, unknown>;
  return {
    name: asString(table.name) ?? "basic",
    title: asString(table.title),
    subTitle: asString(table.sub_title),
    footnote: asString(table.footnote),
    bgColor: asString(table.bg_color) ?? DEFAULT_BG_COLOR,
    colorDifferentRows: table.color_different_rows === true,
  };
}

/**
 * Accept a full URL, a scheme-less linkedin.com path, or a bare vanity handle,
 * and always come back with an absolute https URL. Returning null for anything
 * else keeps javascript: and other schemes out of the exported SVG's href.
 */
function normalizeLinkedIn(value: string): string | null {
  const url = value.trim();
  if (/^https:\/\//i.test(url)) return url;
  if (LINKEDIN_HOST.test(url)) return `https://${url}`;
  if (LINKEDIN_HANDLE.test(url)) return `https://www.linkedin.com/in/${url}`;
  return null;
}

function readPeople(raw: unknown): Person[] | string {
  if (raw === undefined) return "No [[person]] entries found.";
  const entries = Array.isArray(raw) ? raw : [raw];

  const people: Person[] = [];
  for (const [index, entry] of entries.entries()) {
    const table = entry as Record<string, unknown>;
    const position = asString(table?.position);
    if (!position) {
      return `Person #${index + 1} is missing a "position".`;
    }
    if (!DOTTED_NUMBER.test(position)) {
      return `Invalid position "${position}" — expected a dotted number like 1, 1.2 or 1.2.3.`;
    }
    const linkedin = asString(table.linkedin);
    let profile: string | undefined;
    if (linkedin) {
      const normalized = normalizeLinkedIn(linkedin);
      if (!normalized) {
        return `Invalid linkedin "${linkedin}" for position "${position}" — expected an https URL, a linkedin.com path, or a profile handle.`;
      }
      profile = normalized;
    }

    const country = asString(table.country);
    if (country && !COUNTRY_CODE.test(country.trim())) {
      return `Invalid country "${country}" for position "${position}" — expected a two-letter country code like BR or US.`;
    }

    people.push({
      position,
      title: asString(table.title) ?? "",
      name: asString(table.name) ?? "",
      color: asString(table.color) ?? undefined,
      phone: asString(table.phone) ?? undefined,
      email: asString(table.email) ?? undefined,
      headshot: asString(table.headshot) ?? undefined,
      linkedin: profile,
      country: country ? country.trim().toUpperCase() : undefined,
    });
  }
  return people;
}

function buildTree(people: Person[]): { roots: OrgNode[] } | { error: string } {
  const byPosition = new Map<string, OrgNode>();

  for (const person of people) {
    if (byPosition.has(person.position)) {
      return { error: `Duplicate position "${person.position}".` };
    }
    byPosition.set(person.position, {
      ...person,
      depth: person.position.split(".").length - 1,
      children: [],
    });
  }

  const roots: OrgNode[] = [];
  for (const [position, node] of byPosition) {
    const lastDot = position.lastIndexOf(".");
    if (lastDot === -1) {
      roots.push(node);
      continue;
    }
    const parent = byPosition.get(position.slice(0, lastDot));
    if (!parent) {
      return {
        error: `Position "${position}" has no parent "${position.slice(0, lastDot)}".`,
      };
    }
    parent.children.push(node);
  }

  if (roots.length === 0) {
    return { error: "No root person — at least one position must be a single number." };
  }

  const sortNode = (node: OrgNode) => {
    node.children.sort((a, b) => comparePositions(a.position, b.position));
    node.children.forEach(sortNode);
  };
  roots.sort((a, b) => comparePositions(a.position, b.position));
  roots.forEach(sortNode);

  return { roots };
}

export function parseOrgChart(source: string): ParseResult {
  let document: Record<string, unknown>;
  try {
    document = parseToml(normalizeToml(source)) as Record<string, unknown>;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }

  const layout = readLayout(document.layout);
  if (!SUPPORTED_LAYOUTS.has(layout.name)) {
    return {
      ok: false,
      error: `Unknown layout name "${layout.name}" — supported: ${[...SUPPORTED_LAYOUTS].join(", ")}.`,
    };
  }

  const people = readPeople(document.person);
  if (typeof people === "string") {
    return { ok: false, error: people };
  }

  const tree = buildTree(people);
  if ("error" in tree) {
    return { ok: false, error: tree.error };
  }

  return { ok: true, layout, roots: tree.roots };
}
