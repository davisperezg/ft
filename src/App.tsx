import { useQuery } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useState } from "react";
import Main from "./layouts/Main";
import { storage } from "./utils/storage.utils";
import LoginScreen from "./features/Authentication/pages/LoginPage";
import Header from "./layouts/Header";
import { IError } from "./interfaces/common/error.interface";
import { IAuthPayload } from "./interfaces/models/auth/auth.interface";
import { whois } from "./features/Authentication/services/auth.service";
import AppProviders from "./providers/AppProvider";

function App() {
  const [sessionActive, setSession] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const {
    data: result,
    //error,
    isLoading,
    refetch,
  } = useQuery<IAuthPayload, IError>({
    queryKey: ["auth"],
    queryFn: async () => {
      const response = await whois();
      return response.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    refetchInterval: 60000 * 60 * 24,
    enabled: isEnabled,
  });

  useEffect(() => {
    if (storage.getItem("access_token", "SESSION")) {
      const interval = setInterval(
        () => {
          setIsEnabled(true);
        },
        60000 * 60 * 24
      ); // habilitar el query después de 20 segundos

      return () => clearInterval(interval);
    }

    if (storage.getItem("c_server", "LOCAL")) {
      storage.removeItem("c_server", "LOCAL");
    }
  }, []);

  useLayoutEffect(() => {
    if (storage.getItem("access_token", "SESSION")) {
      setSession(true);
      refetch();
    }
  }, [refetch]);

  if (window.location.pathname.toString().substring(1)) {
    return (
      <h1 className="p-5 font-bold tracking-tighter">Archivo no encontrado</h1>
    );
  }

  if (isLoading) {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get("sid");
    const token = storage.getItem("access_token", "SESSION");

    //Si no existe token manda url al original
    if (!token) {
      window.history.replaceState({}, "", window.location.origin);
    } else {
      const nuevaURL = `${window.location.pathname}?sid=${token}`;

      if (sid?.length === 176 && sid.toString() !== token.toString()) {
        storage.clear("SESSION");
        setSession(false);
        storage.setItem("c_session", "close.app", "LOCAL");
      } else {
        window.history.pushState({ path: nuevaURL }, "", nuevaURL);
      }
    }
  } else {
    if (result) {
      storage.setItem("user", JSON.stringify(result), "SESSION");
      window.history.replaceState({}, "", window.location.origin);
    }
  }

  return (
    <>
      {sessionActive ? (
        <AppProviders>
          <Header result={result} />
          <Main />
        </AppProviders>
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

export default App;
