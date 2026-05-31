import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
	plugins: [react()],
	base: "/leaflet-route/",
	resolve: {
		alias: {
			"@app": fileURLToPath(new URL("./src/app", import.meta.url)),
			"@domain": fileURLToPath(new URL("./src/domain", import.meta.url)),
			"@features": fileURLToPath(new URL("./src/features", import.meta.url)),
			"@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
		},
	},
});
