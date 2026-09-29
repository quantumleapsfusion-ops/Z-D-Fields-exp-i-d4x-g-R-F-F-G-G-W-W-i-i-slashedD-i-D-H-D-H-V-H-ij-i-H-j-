export function Avatar({
  image,
  name,
  size = 32,
}: {
  image?: string | null;
  name?: string | null;
  size?: number;
}) {
  const src = image;
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="border-chalk/20 rounded-full border object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="border-chalk/25 bg-chalk/5 font-display text-chalk flex items-center justify-center rounded-full border"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </span>
  );
}
