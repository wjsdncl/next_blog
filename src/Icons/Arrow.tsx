import type IconType from "@/types/IconType";

export function ArrowRight({ width = 24, height = 24, color = "#e8eaed" }: IconType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill={color} viewBox="0 0 24 24">
      <path d="M12 21l-12-18h24z" />
    </svg>
  );
}
