/**
 * The About copy lives here so the drawer, the /about page and the HowTo/FAQ
 * structured data all read from one source. Search engines penalise FAQ markup
 * that isn't visible on the page, so these must never drift apart.
 */

export type Step = {
  title: string;
  body: string;
  code?: string;
};

export const STEPS: Step[] = [
  {
    title: "Describe your team in chart.toml",
    body:
      "Every person is a [person] block with a position, a title and a name. The position is a dotted path that encodes who reports to whom: 1 is the top of the chart, 1.2 reports to 1, and 1.2.3 reports to 1.2. Reorganising is just editing those numbers — add a segment to push someone a level deeper, drop one to promote them.",
    code: `[person]
position = 1
title = "CEO"
name = "Lars Peeters"

[person]
position = 1.1
title = "Finance"
name = "Aaron Loeb"`,
  },
  {
    title: "Start from a template",
    body:
      "The dropdown next to chart.toml loads a complete, working chart you can edit down to your own team. Basic is title and name only; With contact details adds phone and email; With headshots adds avatars; LinkedIn switches to the profile-card layout. Picking a template replaces the editor, so it asks first if you have unsaved edits.",
  },
  {
    title: "Choose a layout, then style it",
    body:
      "The [layout] block sets the chart title, subtitle, footnote and background colour. name selects the card style. Set color_different_rows = true to tint each level of the hierarchy, or give any person their own color to override it — useful for marking out a division or a vacant role.",
    code: `[layout]
name = basic
title = "Company Organizational Chart"
bg_color = "#f7faff"
color_different_rows = true`,
  },
  {
    title: "Export the chart",
    body:
      "SVG stays vector and keeps LinkedIn links clickable. PNG is a 2x raster for slides and documents. PDF is vector too, and profile links become real PDF link annotations; it fits the whole chart onto one sheet of the paper size next to the button, turned landscape when the chart is wider than it is tall. A chart far wider than a page still lands small on it — export SVG when you need it at full size. Remote headshots and flags are fetched and embedded into the PNG and PDF so the files stand alone.",
  },
];

export type Attribute = {
  key: string;
  required: boolean;
  description: string;
};

export const ATTRIBUTES: Attribute[] = [
  {
    key: "position",
    required: true,
    description:
      "Dotted path setting the reporting line, e.g. 1, 1.2, 1.2.3. The prefix is the manager.",
  },
  { key: "name", required: false, description: "The person's name, shown on the card." },
  { key: "title", required: false, description: "Job title or role." },
  {
    key: "color",
    required: false,
    description:
      "Any CSS colour. Fills the header band in the basic layout and the accent bar in the linkedin layout, overriding the row colour.",
  },
  { key: "phone", required: false, description: "Rendered under the name, next to the email." },
  { key: "email", required: false, description: "Rendered under the name, next to the phone." },
  {
    key: "headshot",
    required: false,
    description:
      "Image URL or data: URI, drawn as a circular avatar. Falls back to the person's initials if the image cannot load.",
  },
  {
    key: "linkedin",
    required: false,
    description:
      "Profile URL or handle. In the linkedin layout the card becomes a link that opens the profile in a new tab.",
  },
  {
    key: "country",
    required: false,
    description:
      "Two-letter country code, e.g. BR or US. The linkedin layout draws that country's flag to the right of the LinkedIn badge.",
  },
];

export type Layout = {
  name: string;
  summary: string;
};

export const LAYOUTS: Layout[] = [
  {
    name: "basic",
    summary:
      "A coloured title band above a white body with the name. Optional avatar to the left, and phone and email as a subtitle. The compact default for large organisations.",
  },
  {
    name: "linkedin",
    summary:
      "A profile card: a coloured accent bar with the avatar straddling it, the LinkedIn badge and country flag in the corner, then the name and role. The whole card links to the person's profile.",
  },
];

export type Question = {
  question: string;
  answer: string;
};

export const FAQ: Question[] = [
  {
    question: "What is an org chart?",
    answer:
      "An org chart, or organizational chart, is a diagram of who reports to whom. Each box is a person or a role, and the lines between boxes are reporting relationships. Teams use them to explain structure to new joiners, plan a reorganisation, or show a customer who owns what.",
  },
  {
    question: "How do I build an org chart quickly?",
    answer:
      "Start from a template, then edit the text. Because this organizational chart generator reads a plain text file, building a chart is mostly typing names and reporting lines instead of dragging boxes around a canvas. Layout, spacing and connector routing are worked out for you, and the preview updates as you type.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. There is no sign-up and nothing to install. Your chart is described entirely by the text in the editor, so you can keep chart.toml in version control alongside your code and regenerate the chart whenever the team changes.",
  },
  {
    question: "Can I use my own photos?",
    answer:
      "Yes. Point the headshot attribute at any image URL, or embed the picture directly as a data: URI. Exporting to PNG or PDF fetches remote images and embeds them, so the file works on its own — if a host blocks cross-origin requests the chart falls back to the person's initials and tells you which images it could not embed.",
  },
  {
    question: "Which export format should I use?",
    answer:
      "Use SVG or PDF when the chart needs to stay sharp at any size or keep its links clickable, for example in a handbook or a printed poster. Use PNG when you need to drop the chart straight into a slide, a document or a chat message.",
  },
  {
    question: "How large a chart can it handle?",
    answer:
      "There is no fixed limit on people. The canvas grows to fit the tree and every card is measured to the same size so rows stay aligned. Very wide organisations produce very wide images, so for large charts consider generating one chart per division.",
  },
];
