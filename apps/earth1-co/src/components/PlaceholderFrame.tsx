/**
 * A labelled frame reserving space for founder-supplied material (photographs of
 * notebooks, chalkboards, handwriting). Deliberately obvious: nothing generated goes in
 * here. `id` matches the pending-asset table in docs/ASSETS.md.
 */
export function PlaceholderFrame({
  id,
  needs,
  aspect = "4 / 3",
  className = "",
  children,
}: {
  id: string;
  needs: string;
  aspect?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <figure
      className={`placeholder-frame relative ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <figcaption className="label absolute top-2 right-2 left-2 flex flex-wrap justify-between gap-x-3 gap-y-1">
        <span className="text-ink-2">placeholder · {id}</span>
        <span>awaiting founder asset</span>
      </figcaption>
      <p className="mono text-ink-3 absolute right-3 bottom-2 left-3">{needs}</p>
      {children}
    </figure>
  );
}
