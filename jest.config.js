

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/tests/**/*.test.ts"],
  verbose: true,
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

