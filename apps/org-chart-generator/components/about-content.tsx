import { ATTRIBUTES, FAQ, LAYOUTS, STEPS } from "@/lib/about";

/**
 * The body of the guide, shared by the About drawer and the /about page. Each
 * host supplies its own title, so it passes the level the section headings sit
 * under: h3 beneath the drawer's h2 SheetTitle, h2 beneath the page's h1.
 * No hooks or state — it renders fine on the server.
 */
export function AboutContent({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
      <section className="space-y-3">
        <Heading className="text-base font-semibold text-foreground">
          Four steps to a finished chart
        </Heading>
        <ol className="space-y-5">
          {STEPS.map((step, index) => (
            <li key={step.title} id={`step-${index + 1}`} className="scroll-mt-16 space-y-2">
              <p className="font-medium text-foreground">
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs tabular-nums">
                  {index + 1}
                </span>
                {step.title}
              </p>
              <p>{step.body}</p>
              {step.code && (
                <pre className="overflow-x-auto rounded-md border bg-muted/50 p-3 font-mono text-xs text-foreground">
                  <code>{step.code}</code>
                </pre>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <Heading className="text-base font-semibold text-foreground">Person attributes</Heading>
        <dl className="space-y-2">
          {ATTRIBUTES.map((attribute) => (
            <div key={attribute.key} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="font-mono text-xs text-foreground">
                {attribute.key}
                {attribute.required && <span className="ml-1 text-destructive">*</span>}
              </dt>
              <dd>{attribute.description}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs">* required</p>
      </section>

      <section className="space-y-3">
        <Heading className="text-base font-semibold text-foreground">Layouts</Heading>
        <dl className="space-y-3">
          {LAYOUTS.map((layout) => (
            <div key={layout.name} className="space-y-1">
              <dt className="font-mono text-xs text-foreground">name = {layout.name}</dt>
              <dd>{layout.summary}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3">
        <Heading className="text-base font-semibold text-foreground">Questions</Heading>
        <dl className="space-y-4">
          {FAQ.map((entry) => (
            <div key={entry.question} className="space-y-1">
              <dt className="font-medium text-foreground">{entry.question}</dt>
              <dd>{entry.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
