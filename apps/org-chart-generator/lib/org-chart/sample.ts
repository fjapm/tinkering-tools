export const SAMPLE_TOML = `[layout]
name = basic
title = "Company Organizational Chart"
sub_title = "Effective Q3 2026 — People Operations"
footnote = "Generated from chart.toml. Dotted reporting lines not shown."
# bg_color takes any CSS colour, or "transparent".
bg_color = "#f7faff"
color_different_rows = true

# "position" is a dotted path: 1.2.3 reports to 1.2, which reports to 1.

[person]
position = 1
title = "CEO"
name = "Lars Peeters"

[person]
position = 1.1
title = "Finance"
name = "Aaron Loeb"

[person]
position = 1.1.1
title = "Manager"
name = "Drew Feig"

[person]
position = 1.1.1.1
title = "Worker"
name = "Korina Villanueva"

[person]
position = 1.1.1.1.1
title = "Worker"
name = "Sacha Dubois"

[person]
position = 1.1.1.1.1.1
title = "Intern"
name = "Samira Hadid"

[person]
position = 1.1.2
title = "Manager"
name = "Alfredo Torres"

[person]
position = 1.1.2.1
title = "Worker"
name = "Kyrie Petrakis"

[person]
position = 1.1.2.1.1
title = "Worker"
name = "Rufus Stewart"

[person]
position = 1.1.2.1.1.1
title = "Intern"
name = "Matt Zhang"

[person]
position = 1.2
title = "Director"
name = "Daniel Gallego"

[person]
position = 1.2.1
title = "Manager"
name = "Adora Montminy"

[person]
position = 1.2.1.1
title = "Worker"
name = "Reese Miller"

[person]
position = 1.2.1.1.1
title = "Worker"
name = "Margarita Perez"

[person]
position = 1.2.1.1.1.1
title = "Intern"
name = "Helene Paquet"

[person]
position = 1.3
title = "HR"
name = "Juliana Silva"

[person]
position = 1.3.1
title = "Manager"
name = "Estelle Darcy"

[person]
position = 1.3.1.1
title = "Worker"
name = "Rachelle Beaudry"

[person]
position = 1.3.1.1.1
title = "Worker"
name = "Harper Russo"

[person]
position = 1.3.1.1.1.1
title = "Intern"
name = "Cahaya Dewi"

[person]
position = 1.4
title = "Marketing"
name = "Pedro Fernandes"

[person]
position = 1.4.1
title = "Manager"
name = "Ketut Susilo"

[person]
position = 1.4.1.1
title = "Worker"
name = "Richard Sanchez"

[person]
position = 1.4.1.1.1
title = "Worker"
name = "Hannah Morales"

[person]
position = 1.4.1.1.1.1
title = "Intern"
name = "Chad Gibbons"

[person]
position = 1.4.2
title = "Manager"
name = "Olivia Wilson"

[person]
position = 1.4.2.1
title = "Worker"
name = "Bailey Dupont"

[person]
position = 1.4.2.1.1
title = "Worker"
name = "Benjamin Shah"

[person]
position = 1.4.2.1.1.1
title = "Intern"
name = "Claudia Alves"
`;
