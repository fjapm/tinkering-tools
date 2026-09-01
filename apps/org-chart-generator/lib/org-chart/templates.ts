import { SAMPLE_TOML } from "./sample";

const CONTACT_TOML = `[layout]
name = basic
title = "Company Organizational Chart"
sub_title = "Effective Q3 2026 — People Operations"
footnote = "Contact details are optional — a person renders fine without them."
bg_color = "#f7faff"
color_different_rows = true

# On top of "title" and "name", a person can carry "phone" and "email". They
# render under the name as a subtitle, separated by a middle dot.

[person]
position = 1
title = "CEO"
name = "Lars Peeters"
phone = "+31 20 555 0100"
email = "lars.peeters@example.com"

[person]
position = 1.1
title = "Finance"
name = "Aaron Loeb"
phone = "+31 20 555 0110"
email = "aaron.loeb@example.com"

[person]
position = 1.1.1
title = "Manager"
name = "Drew Feig"
phone = "+31 20 555 0111"
email = "drew.feig@example.com"

[person]
position = 1.2
title = "Operations"
name = "Daniel Gallego"
phone = "+31 20 555 0120"
email = "daniel.gallego@example.com"

[person]
position = 1.2.1
title = "Manager"
name = "Adora Montminy"
phone = "+31 20 555 0121"
email = "adora.montminy@example.com"

# Attributes are per person: this one lists a phone but no email.

[person]
position = 1.3
title = "People"
name = "Juliana Silva"
phone = "+31 20 555 0130"

[person]
position = 1.4
title = "Marketing"
name = "Pedro Fernandes"
phone = "+31 20 555 0140"
email = "pedro.fernandes@example.com"

[person]
position = 1.4.1
title = "Manager"
name = "Ketut Susilo"
phone = "+31 20 555 0141"
email = "ketut.susilo@example.com"
`;

const HEADSHOTS_TOML = `[layout]
name = basic
title = "Company Organizational Chart"
sub_title = "Effective Q3 2026 — People Operations"
footnote = "Headshots are fetched and embedded when you export to PNG or PDF."
bg_color = "#f7faff"
color_different_rows = true

# "headshot" takes an image URL or a data: URI and draws a circular avatar to
# the left of the name. Anyone without one falls back to their initials.
#
# PNG and PDF export has to read the image bytes, so a remote host must allow
# cross-origin requests. If it doesn't, the initials are used instead — embed
# the picture as a data: URI to be certain it survives the export.

[person]
position = 1
title = "CEO"
name = "Lars Peeters"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Lars%20Peeters&size=96&backgroundColor=e8edf7"
phone = "+31 20 555 0100"
email = "lars.peeters@example.com"

[person]
position = 1.1
title = "Finance"
name = "Aaron Loeb"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Aaron%20Loeb&size=96&backgroundColor=e8edf7"
phone = "+31 20 555 0110"
email = "aaron.loeb@example.com"

[person]
position = 1.1.1
title = "Manager"
name = "Drew Feig"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Drew%20Feig&size=96&backgroundColor=e8edf7"
phone = "+31 20 555 0111"
email = "drew.feig@example.com"

[person]
position = 1.2
title = "Operations"
name = "Daniel Gallego"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Daniel%20Gallego&size=96&backgroundColor=e8edf7"
phone = "+31 20 555 0120"
email = "daniel.gallego@example.com"

[person]
position = 1.2.1
title = "Manager"
name = "Adora Montminy"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Adora%20Montminy&size=96&backgroundColor=e8edf7"
phone = "+31 20 555 0121"
email = "adora.montminy@example.com"

# No headshot for this one — her initials fill the avatar instead.

[person]
position = 1.3
title = "People"
name = "Juliana Silva"
phone = "+31 20 555 0130"
email = "juliana.silva@example.com"

[person]
position = 1.4
title = "Marketing"
name = "Pedro Fernandes"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Pedro%20Fernandes&size=96&backgroundColor=e8edf7"
phone = "+31 20 555 0140"
email = "pedro.fernandes@example.com"

[person]
position = 1.4.1
title = "Manager"
name = "Ketut Susilo"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Ketut%20Susilo&size=96&backgroundColor=e8edf7"
phone = "+31 20 555 0141"
email = "ketut.susilo@example.com"
`;

const LINKEDIN_TOML = `[layout]
name = linkedin
title = "Company Organizational Chart"
sub_title = "Effective Q3 2026 — People Operations"
footnote = "Every card links to a LinkedIn profile. Links survive the SVG and PDF exports."
bg_color = "#eef1f5"

# The "linkedin" layout draws a profile card: a coloured accent bar with the
# avatar straddling it, the LinkedIn badge and the country flag in the corner,
# then the name and the role. Clicking a card opens that profile in a new tab.
#
# "color" sets the accent bar (and the header band in the basic layout). Any
# CSS colour works; it overrides color_different_rows for that person.
#
# "linkedin" accepts a full https URL, a scheme-less linkedin.com path, or just
# a profile handle — all three appear below. These are placeholders.
#
# "country" is a two-letter country code and draws that country's flag to the
# right of the badge. The badge and the flag are independent: a person can have
# either, both, or neither.

[person]
position = 1
title = "Co-Founder and CEO"
name = "Lars Peeters"
color = "#f97316"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Lars%20Peeters&size=96&backgroundColor=f97316"
linkedin = "https://www.linkedin.com/in/example-lars-peeters"
country = "NL"

[person]
position = 1.1
title = "Chief Operating Officer"
name = "Aaron Loeb"
color = "#f59e0b"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Aaron%20Loeb&size=96&backgroundColor=f59e0b"
linkedin = "www.linkedin.com/in/example-aaron-loeb"
country = "US"

[person]
position = 1.1.1
title = "VP, Data"
name = "Drew Feig"
color = "#f59e0b"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Drew%20Feig&size=96&backgroundColor=f59e0b"
linkedin = "example-drew-feig"
country = "US"

[person]
position = 1.2
title = "Chief Technology Officer"
name = "Daniel Gallego"
color = "#ef4444"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Daniel%20Gallego&size=96&backgroundColor=ef4444"
linkedin = "https://www.linkedin.com/in/example-daniel-gallego"
country = "ES"

[person]
position = 1.2.1
title = "EVP, Engineering"
name = "Adora Montminy"
color = "#ef4444"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Adora%20Montminy&size=96&backgroundColor=ef4444"
linkedin = "https://www.linkedin.com/in/example-adora-montminy"
country = "FR"

[person]
position = 1.3
title = "Chief Marketing Officer"
name = "Pedro Fernandes"
color = "#22c55e"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Pedro%20Fernandes&size=96&backgroundColor=22c55e"
linkedin = "https://www.linkedin.com/in/example-pedro-fernandes"
country = "PT"

# A long role wraps onto a second line, and every card grows to match.

[person]
position = 1.3.1
title = "VP of Product Management and Ads Monetization"
name = "Ketut Susilo"
color = "#22c55e"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Ketut%20Susilo&size=96&backgroundColor=22c55e"
linkedin = "https://www.linkedin.com/in/example-ketut-susilo"
country = "ID"

[person]
position = 1.4
title = "Chief People Officer"
name = "Juliana Silva"
color = "#ec4899"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Juliana%20Silva&size=96&backgroundColor=ec4899"
linkedin = "https://www.linkedin.com/in/example-juliana-silva"
country = "BR"

# No headshot and no profile: the avatar falls back to initials and the card
# renders without the badge and without a link. The flag still shows.

[person]
position = 1.4.1
title = "VP, Community"
name = "Estelle Darcy"
color = "#14b8a6"
country = "IE"

[person]
position = 1.5
title = "Chief Financial Officer"
name = "Olivia Wilson"
color = "#6366f1"
headshot = "https://api.dicebear.com/9.x/notionists/png?seed=Olivia%20Wilson&size=96&backgroundColor=6366f1"
linkedin = "https://www.linkedin.com/in/example-olivia-wilson"
country = "GB"
`;

export type Template = {
  id: string;
  label: string;
  toml: string;
};

export const TEMPLATES: Template[] = [
  { id: "basic", label: "Basic", toml: SAMPLE_TOML },
  { id: "contact", label: "With contact details", toml: CONTACT_TOML },
  { id: "headshots", label: "With headshots", toml: HEADSHOTS_TOML },
  { id: "linkedin", label: "LinkedIn", toml: LINKEDIN_TOML },
];

export const DEFAULT_TEMPLATE = TEMPLATES[0];
