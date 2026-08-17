import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root:"github-pages-src",
  base:"/Family-tree/",
  plugins:[react()],
  build:{outDir:"../pages-dist",emptyOutDir:true},
});
