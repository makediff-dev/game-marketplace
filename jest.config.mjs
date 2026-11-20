import nextJest from "next/jest.js";

process.env.TZ = "Europe/Moscow";

const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/api/(.*)$": "<rootDir>/lib/api/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  collectCoverageFrom: [
    "lib/api/**/*.ts",
    "app/**/*.{ts,tsx}",
    "components/**/*.tsx",
    "hooks/**/*.ts",
    "lib/**/*.ts",
    "store/**/*.ts",
    "types/**/*.ts",
    "middleware.ts",
  ],
});
