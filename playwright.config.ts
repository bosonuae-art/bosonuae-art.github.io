import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  timeout: 30000,
  use: {
    // Dedicated port to avoid colliding with Astro's default 4321 used by
    // other local projects/sessions.
    baseURL: "http://localhost:4487",
  },
  webServer: {
    command: "npm run preview -- --port 4487",
    url: "http://localhost:4487",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
