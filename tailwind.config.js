/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        // CMDA brand — purple system (primary #994279, dark #6E2F50)
        primary: "#994279",
        dark: "#6E2F50",
        onPrimary: "#F5ECF2",
        primaryContainer: "#6E2F50",
        onPrimaryContainer: "#E0C6D7",
        primaryTint: "#F7EAF2",
        primaryTint2: "#F4EEF2",
        // secondary = brand dark purple (accent variant of primary)
        secondary: "#6E2F50",
        onSecondary: "#F4EEF2",
        secondaryContainer: "#6E2F50",
        onSecondaryContainer: "#F4EEF2",
        // tertiary = brand neutral (charcoal accent)
        tertiary: "#333333",
        onTertiary: "#F4F4F4",
        tertiaryContainer: "#333333",
        onTertiaryContainer: "#F4F4F4",
        // neutrals
        ink: "#333333",
        muted: "#666666",
        surface: "#F4F4F4",
        background: "#FDFBFC",
        error: "#FF4040",
        success: "#117E45",
        gray: { DEFAULT: "#999798", light: "#E9E8E9", dark: "#4D494C" },
      },
      animation: {
        slidein: "slidein 0.3s ease-in-out",
      },
      keyframes: {
        slidein: {
          "0%": {
            transform: "translateX(-100%)",
            opacity: 0,
          },
          "100%": {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [],
};
