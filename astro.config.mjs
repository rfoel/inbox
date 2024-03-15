import { defineConfig } from "astro/config";
import aws from "astro-sst";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

export default defineConfig({
	output: "server",
	adapter: aws({
		serverRoutes: ["api/*"],
	}),
	integrations: [tailwind(), react()],
	vite: {
		optimizeDeps: {
			exclude: ["sst"],
		},
	},
});
