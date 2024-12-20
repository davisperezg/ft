import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

//import million from "million/compiler";
//million.vite({ auto: true }),
// https://vitejs.dev/config/
const ReactCompilerConfig = {
  target: "19", // '17' | '18' | '19'
};

export default defineConfig(() => {
  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
        },
      }),
    ],
    // ...
  };
});
