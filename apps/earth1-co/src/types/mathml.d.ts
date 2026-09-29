import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      math: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { display?: "block" | "inline" },
        HTMLElement
      >;
    }
  }
}
