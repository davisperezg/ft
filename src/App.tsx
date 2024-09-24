import { useQuery } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useState } from "react";
import { whois } from "./api/auth";
import Main from "./components/Main";
import { ModalProvider } from "./context/modalContext";
import { storage } from "./utils/storage";
import LoginScreen from "./views/LoginScreen";
import Header from "./components/Header/Index";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { TableProvider } from "./context/tableContext";
import { IAuthPayload } from "./interface/auth.interface";
import { IError } from "./interface/error.interface";

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
      return response.data; // Assuming the desired data is in the `data` property of the Axios response
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
        <ModalProvider>
          <TableProvider>
            <DndProvider backend={HTML5Backend}>
              <Header result={result} />
              <Main />
            </DndProvider>
          </TableProvider>
        </ModalProvider>
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

export default App;
