export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Blue for secure/trust feel
        secondary: "#3B82F6",
        neutral: "#F3F4F6", // Light gray background
        accent: "#10B981", // Green for success
        error: "#EF4444", // Red for errors
      },
    },
  },
  plugins: [],
};
