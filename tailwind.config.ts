import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      error: "#EF4444",
    },
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
      },
      colors: {
        _white: {
          DEFAULT: "hsl(210, 40%, 95%)",
        },
        _black: {
          DEFAULT: "#212121",
        },
        _gray: {
          DEFAULT: "hsl(0, 0%, 50%)",
          100: "hsl(0, 0%, 90%)",
          200: "hsl(0, 0%, 80%)",
          300: "hsl(0, 0%, 70%)",
          400: "hsl(0, 0%, 60%)",
          500: "hsl(0, 0%, 50%)",
          600: "hsl(0, 0%, 40%)",
          700: "hsl(0, 0%, 30%)",
          800: "hsl(0, 0%, 20%)",
          900: "hsl(0, 0%, 10%)",
        },
      },
      width: {
        mobile: "360px",
        tablet: "760px",
        desktop: "1200px",
      },
      screens: {
        mobile: "375px",
        tablet: "768px",
        desktop: "1280px",
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
