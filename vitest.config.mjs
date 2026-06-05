import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Live conversions take several seconds; unit tests finish well under this.
    testTimeout: 120000,
  },
});
