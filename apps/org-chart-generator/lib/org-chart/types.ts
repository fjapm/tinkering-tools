export type Person = {
  /** Dotted path, e.g. "1", "1.2", "1.2.3". The prefix is the parent. */
  position: string;
  title: string;
  name: string;
  /** Optional per-person header colour, overrides the row colour. */
  color?: string;
};

export type LayoutOptions = {
  name: string;
  title: string | null;
  subTitle: string | null;
  footnote: string | null;
  /** Any CSS colour, or "transparent" to omit the background entirely. */
  bgColor: string;
  colorDifferentRows: boolean;
};

export type OrgNode = Person & {
  depth: number;
  children: OrgNode[];
};

export type ParseResult =
  | { ok: true; layout: LayoutOptions; roots: OrgNode[] }
  | { ok: false; error: string };
