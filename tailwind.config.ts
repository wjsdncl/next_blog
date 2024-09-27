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
      keyframes: {
        "scale-up": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-5px)" },
          "40%, 80%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "scale-up": "scale-up 0.3s ease-out 0.1s forwards",
        "fade-shake": "fadeIn 0.3s ease-in-out forwards, shake 0.3s ease-in-out 0.3s forwards",
        "fade-in": "fadeIn 0.3s ease-in-out forwards",
      },
      typography: {
        DEFAULT: {
          css: {
            margin: "2.rem 0",
            code: {
              backgroundColor: "var(--color-gray-200)",
              padding: "0.3rem 0.5rem",
              borderRadius: "4px",
              fontSize: "90%",
              fontWeight: "500",
              fontFamily: "Consolas",
            },
            pre: {
              backgroundColor: "transparent",
              padding: "0",
              border: "none",
              borderRadius: "0",
              boxShadow: "none",
              margin: "0",
              fontSize: "16px",
              overflow: "auto",
              lineHeight: "1.5",
            },
            blockquote: {
              borderLeftColor: "#888497",
              paddingLeft: "1rem",
              fontStyle: "normal",
              quotes: "none",
              backgroundColor: "#323137",
              color: "#fff",
              paddingTop: "10px",
              paddingBottom: "10px",
              borderTopRightRadius: "0.25rem",
              borderBottomRightRadius: "0.25rem",
              p: {
                marginTop: 0,
                marginBottom: 0,
              },
            },
            hr: {
              margin: "1.5rem 0",
            },
          },
        },
      },
    },
  },
  darkMode: "selector",
  plugins: [
    require("@tailwindcss/typography"),
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
