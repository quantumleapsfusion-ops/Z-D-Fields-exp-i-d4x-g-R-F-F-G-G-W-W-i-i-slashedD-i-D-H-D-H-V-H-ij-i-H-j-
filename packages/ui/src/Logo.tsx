type LogoBrand = "e1-4" | "earth1";

type LogoProps = {
  /** `e1-4` is the Ψ avatar (e1-4.com); `earth1` is the Earth One cross icon (earth1.co). */
  brand?: LogoBrand;
  size?: number;
  className?: string;
  title?: string;
};

const SRC: Record<LogoBrand, string> = {
  "e1-4": "/brand/e1-4.png",
  earth1: "/brand/earth1.png",
};

/**
 * Brand mark: e1-4's bead-drawn Ψπ sits in a round disc, earth1's icon in a rounded square tile. Assets live in each app's `public/brand/`, so both apps must ship both files.
 */
export function Logo({ brand = "e1-4", size = 32, className, title }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- shared package, no next/image dependency
    <img
      src={SRC[brand]}
      alt={title ?? (brand === "earth1" ? "earth1" : "e1-4")}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: brand === "e1-4" ? "50%" : Math.round(size * 0.22),
      }}
      draggable={false}
    />
  );
}
