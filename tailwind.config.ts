import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      white: "var(--color-white)",
      black: "var(--color-black)",
      gray: {
        100: "var(--color-gray-100)",
        200: "var(--color-gray-200)",
        300: "var(--color-gray-300)",
        400: "var(--color-gray-400)",
        500: "var(--color-gray-500)",
        600: "var(--color-gray-600)",
        700: "var(--color-gray-700)",
        800: "var(--color-gray-800)",
        900: "var(--color-gray-900)",
      },
      background: {
        primary: "var(--background-primary)",
        secondary: "var(--background-secondary)",
        tertiary: "var(--background-tertiary)",
      },
      text: {
        primary: "var(--text-primary)",
      },
      brand: {
        primary: "#656079",
        secondary: "#888497",
        tertiary: "#ABA8B5",
        quaternary: "#CDCCD2",
      },
      brand_dark: {
        primary: "#656079",
        secondary: "#545063",
        tertiary: "#43414D",
        quaternary: "#323137",
      },
      error: "#EF4444",
    },
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
      },
      width: {
        tablet: "768px",
        desktop: "1200px",
      },
      screens: {
        tablet: "768px",
        desktop: "1200px",
      },
    },
  },
  darkMode: "selector",
  plugins: [
    plugin(({ addUtilities, addVariant }) => {
      // 스크롤바 숨김
      addUtilities({
        ".scrollbar-hide": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
      // 스크롤바 커스텀
      addVariant("scrollbar", "&::-webkit-scrollbar");
      addVariant("scrollbar-thumb", "&::-webkit-scrollbar-thumb");
    }),
  ],
};
