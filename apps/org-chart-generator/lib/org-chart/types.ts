export type Person = {
  /** Dotted path, e.g. "1", "1.2", "1.2.3". The prefix is the parent. */
  position: string;
  title: string;
  name: string;
  /**
   * Optional per-person colour. Overrides the row colour: it fills the header
   * band in the basic layout and the accent bar in the linkedin layout.
   */
  color?: string;
  /** Rendered under the name as a middle-dot separated subtitle. */
  phone?: string;
  email?: string;
  /** Image URL or data: URI, drawn as a circular avatar left of the name. */
  headshot?: string;
  /** Absolute https profile URL, normalised by the parser. Used by the linkedin layout. */
  linkedin?: string;
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
