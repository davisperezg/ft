import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles/globals/style.css";
import {
  ThemeProvider,
  createTheme,
  PaletteColorOptions,
} from "@mui/material/styles";
import { Toaster } from "sonner";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { jwtInterceptor } from "./lib/axiosInstance";
import { ColumnDef, RowData } from "@tanstack/react-table";
//import { ExtendedTableOptions } from "./components/common/Table/types";
//import "@mui/lab/themeAugmentation";

jwtInterceptor();

//https://tanstack.com/table/latest/docs/guide/custom-features#step-2-use-declaration-merging-to-add-new-types-to-tanstack-table
declare module "@tanstack/react-table" {
  export type ExtendedColumnDef<TData extends RowData> = ColumnDef<TData> & {
    visible?: boolean; // Nueva propiedad opcional
  };
  //interface TableOptionsResolved<TData> extends ExtendedTableOptions {}
  // interface TableState extends ExtendedTableOptions {}
  // interface TableOptions<TData> extends ExtendedTableOptions {}
  //interface Table<TData extends RowData> extends ExtendedTableOptions {}

  // ts-ignore
  //interface RequiredKeys<T> extends ExtendedTableOptions {}
}

declare module "@mui/material/styles" {
  interface Palette {
    borderAux: PaletteColorOptions;
    primaryHover: PaletteColorOptions;
  }
  interface PaletteOptions {
    borderAux: PaletteColorOptions;
    primaryHover: PaletteColorOptions;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    borderAux: true;
    primaryHover: true;
  }
}

const { palette } = createTheme();

const theme = createTheme({
  palette: {
    primary: {
      main: "#007BE8",
    },
    secondary: {
      main: "#5A626F",
    },
    borderAux: palette.augmentColor({
      color: {
        main: "#E3E4E6",
      },
    }),
    primaryHover: palette.augmentColor({
      color: {
        main: "#0069c5",
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

ReactDOM.createRoot(document.getElementById("root")! as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <StyledEngineProvider injectFirst> */}
      <ThemeProvider theme={theme}>
        <App />
        <Toaster
          position="bottom-center"
          expand={true}
          richColors
          duration={3000}
          toastOptions={{
            className: "px-[20px] py-[15px]",
          }}
        />
      </ThemeProvider>
      {/* </StyledEngineProvider> */}

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
