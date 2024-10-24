import IconType from "@/types/IconType";

export default function Search({ width = 24, height = 24, color = "#000" }: IconType) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_2562_48083)">
        <circle
          cx="10.7541"
          cy="9.80566"
          r="6"
          transform="rotate(-45 10.7541 9.80566)"
          stroke={color}
          strokeWidth="2"
        />
        <path
          d="M18.3901 18.7554C18.7807 19.1459 19.4138 19.1459 19.8044 18.7554C20.1949 18.3649 20.1949 17.7317 19.8044 17.3412L18.3901 18.7554ZM14.1475 14.5128L18.3901 18.7554L19.8044 17.3412L15.5617 13.0986L14.1475 14.5128Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_2562_48083">
          <rect width={width} height={height} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
