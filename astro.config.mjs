import { defineConfig } from "astro/config";
import aws from "astro-sst";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: aws(),
  integrations: [tailwind(), react()]
});