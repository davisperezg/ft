import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { jwtInterceptor } from "./utils/axios";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

jwtInterceptor();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
