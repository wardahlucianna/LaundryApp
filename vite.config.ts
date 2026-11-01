import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/main.tsx"],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            src: path.resolve(process.cwd(), "resources/js/coreui-template"),
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".scss"],
    },
});
