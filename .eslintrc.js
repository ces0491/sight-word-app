.eslintrc.js

/**
 * ESLint configuration file
 */
module.exports = {
  extends: ["next", "next/core-web-vitals"],
  rules: {
    // Override the unescaped entities rule if you prefer not to escape quotes in your JSX
    "react/no-unescaped-entities": [
      "error",
      {
        forbid: [">", "}"], // Only enforce > and } as these are the ones that can break JSX
      },
    ],
    // Set exhaustive-deps to warning instead of error if you're handling dependencies differently
    "react-hooks/exhaustive-deps": "warn",
  },
  // You can ignore specific files if needed
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "public/",
    "*.config.js",
    "*.config.mjs",
  ],
};