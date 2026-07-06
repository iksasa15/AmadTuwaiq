import { cn } from "../../lib/cn";

const sizes = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

type LogoProps = {
  size?: keyof typeof sizes;
  className?: string;
  alt?: string;
};

export default function Logo({ size = "sm", className, alt = "رقيب" }: LogoProps) {
  return (
    <img
      src="/raqeeb-logo.png"
      alt={alt}
      className={cn("shrink-0 rounded-[var(--radius-card)] object-contain", sizes[size], className)}
    />
  );
}
