/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core design system
        border: "hsl(var(--border))",       // Enables border-border
        background: "hsl(var(--background))", // Soft/faded background
        foreground: "hsl(var(--foreground))", // Primary text color

        // Optional interactive colors
        primary: "hsl(var(--primary))",
        primaryHover: "hsl(var(--primary-hover))",
        secondary: "hsl(var(--secondary))",
        secondaryHover: "hsl(var(--secondary-hover))",
        accent: "hsl(var(--accent))",
        accentHover: "hsl(var(--accent-hover))",

        // Card backgrounds for layered look
        card: "hsl(var(--card))",
        cardForeground: "hsl(var(--card-foreground))",
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.06)",
        elegant: "0 10px 30px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "gradient-faded": "linear-gradient(135deg, hsl(195, 80%, 95%), hsl(195, 80%, 88%))",
      },
      transitionProperty: {
        bg: "background-color, background-image",
        shadow: "box-shadow",
        transform: "transform",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
        slideUp: "slideUp 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
