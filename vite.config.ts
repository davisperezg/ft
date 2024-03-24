import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
//import million from "million/compiler";
//million.vite({ auto: true }), 
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
