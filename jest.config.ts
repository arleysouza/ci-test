import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/tests/**/*.test.ts"],
  verbose: true,

   // Adicione estas linhas para resolver o warning de ES module
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  extensionsToTreatAsEsm: [".ts"]
};

export default config;
