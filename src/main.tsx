import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { jwtInterceptor } from "./utils/axios";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
  PaletteColorOptions,
} from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

jwtInterceptor();

declare module "@mui/material/styles" {
  interface Palette {
    borderAux: PaletteColorOptions;
  }
  interface PaletteOptions {
    borderAux: PaletteColorOptions;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    borderAux: true;
  }
}

const { palette } = createTheme();

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF0000 ",
    },
    secondary: {
      main: "#5A626F",
    },
    borderAux: palette.augmentColor({
      color: {
        main: "#E3E4E6",
      },
    }),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
      networkMode: "always",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <StyledEngineProvider injectFirst> */}
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
      {/* </StyledEngineProvider> */}

      <ToastContainer
        autoClose={3000}
        theme="colored"
        pauseOnFocusLoss={false}
        role="alert"
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
