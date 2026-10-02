import katex from "katex";

type TexProps = {
  tex: string;
  /** Spoken/accessible text; the rendered maths is hidden from assistive tech. */
  label: string;
  display?: boolean;
  className?: string;
};

/** Server-rendered KaTeX. No client JavaScript; the CSS is imported once in the root layout. */
export function Tex({ tex, label, display = false, className }: TexProps) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    output: "html",
    strict: "ignore",
  });
  return (
    <span className={className} role="math" aria-label={label}>
      <span aria-hidden dangerouslySetInnerHTML={{ __html: html }} />
    </span>
  );
}
