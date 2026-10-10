// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

/**
 * Server-only secrets that `.env` may supply during local development.
 *
 * Vite parses `.env` for `import.meta.env` but never populates `process.env`,
 * and the Lovable preset's own injection is scoped to `VITE_*` — which is
 * deliberately the wrong home for a secret, since that prefix inlines the value
 * into the client bundle for anyone to read. Server code therefore has to read
 * `process.env`, so the values are mirrored across here.
 *
 * Named explicitly rather than copied wholesale: `loadEnv` with an empty prefix
 * returns the entire process environment merged with the file, so a blanket copy
 * would be both pointless and a way to smuggle unrelated vars in.
 *
 * In production `.env` doesn't ship — the platform (Lovable env settings, or
 * `wrangler secret put`) supplies these in the worker environment directly.
 */
const SERVER_ENV_KEYS = ["GROQ_API_KEY"] as const;

// At module scope rather than inside `defineConfig(fn)`: the preset's function
// overloads return a plain Vite `UserConfig`, which has no `tanstackStart`
// field, so the custom server entry below would be silently dropped.
const fileEnv = loadEnv(
  process.env["NODE_ENV"] === "production" ? "production" : "development",
  process.cwd(),
  "",
);
for (const key of SERVER_ENV_KEYS) {
  const value = fileEnv[key];
  // A real environment variable always wins over the file.
  if (value && process.env[key] === undefined) {
    process.env[key] = value;
  }
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
