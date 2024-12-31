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
      black_opacity: {
        80: "rgb(33,33,33,0.8)",
        60: "rgb(33,33,33,0.6)",
        50: "rgb(33,33,33,0.5)",
        40: "rgb(33,33,33,0.4)",
        30: "rgb(33,33,33,0.3)",
        20: "rgb(33,33,33,0.2)",
        10: "rgb(33,33,33,0.1)",
      },
      gray: {
        50: "var(--color-gray-50)",
        100: "var(--color-gray-100)",
        150: "var(--color-gray-150)",
        200: "var(--color-gray-200)",
        250: "var(--color-gray-250)",
        300: "var(--color-gray-300)",
        350: "var(--color-gray-350)",
        400: "var(--color-gray-400)",
        450: "var(--color-gray-450)",
        500: "var(--color-gray-500)",
        550: "var(--color-gray-550)",
        600: "var(--color-gray-600)",
        650: "var(--color-gray-650)",
        700: "var(--color-gray-700)",
        750: "var(--color-gray-750)",
        800: "var(--color-gray-800)",
        850: "var(--color-gray-850)",
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
        tertiary: "#8f83ed",
        quaternary: "#a89bff",
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
            maxWidth: "100%",
            margin: "1rem 0",
            color: "var(--text-primary)",
            h1: {
              position: "relative",
              marginTop: "0",
              marginBottom: "1rem",
              paddingBottom: "0",
              // borderBottom: "4px solid var(--color-gray-300)",
            },
            h2: {
              position: "relative",
              marginTop: "1rem",
              marginBottom: "1rem",
              paddingBottom: "0",
              // borderBottom: "3px solid var(--color-gray-300)",
            },
            code: {
              backgroundColor: "var(--color-gray-200)",
              color: "var(--text-primary)",
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
              borderLeftColor: "#656079",
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
              borderColor: "var(--color-gray-300)",
              borderWidth: "1.5px",
            },
            li: {
              margin: "5px 0",
              p: {
                margin: "0",
                marginTop: "1rem",
                "&:first-child": {
                  marginTop: "0",
                },
              },
            },
            table: {
              width: "100%",
              borderCollapse: "collapse",
              margin: "1.5rem 0",
              tableLayout: "fixed",
            },
            thead: {
              backgroundColor: "#292929",
              color: "var(--color-white)",
            },
            th: {
              padding: "0.75rem 1rem",
              border: "1px solid var(--color-gray-400)",
              borderBottom: "2px solid var(--color-gray-400)",
              textAlign: "left",
              fontWeight: "bold",
            },
            td: {
              padding: "0.75rem 1rem",
              border: "1px solid var(--color-gray-300)",
            },
            "tbody tr:nth-child(even)": {
              backgroundColor: "#101010",
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
