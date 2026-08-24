/**
 * Emits a JSON-LD block. Escaping "<" keeps a stray "</script>" inside the
 * data from closing the element early.
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
