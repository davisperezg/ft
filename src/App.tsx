import { useQuery } from "@tanstack/react-query";
import { startTransition, useEffect, useLayoutEffect, useState } from "react";
import { whois } from "./api/auth";
import Main from "./components/Main";
import { ModalProvider } from "./context/modalContext";
import { storage } from "./utils/storage";
import LoginScreen from "./views/LoginScreen";
import Header from "./components/Header/Index";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

function App() {
  const [sessionActive, setSession] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    data: result,
    error,
    isLoading,
    refetch,
    status,
    fetchStatus,
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => await whois(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    refetchInterval: 60000 * 60 * 24,
    enabled: isEnabled,
  });

  useEffect(() => {
    if (storage.getItem("access_token", "SESSION")) {
      const interval = setInterval(() => {
        setIsEnabled(true);
      }, 60000 * 60 * 24); // habilitar el query después de 20 segundos

      return () => clearInterval(interval);
    }

    if (storage.getItem("c_server", "LOCAL")) {
      storage.removeItem("c_server", "LOCAL");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [storage]);

  useLayoutEffect(() => {
    if (storage.getItem("access_token", "SESSION")) {
      setSession(true);
      refetch();
    }
  }, [storage]);

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

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
      const { data } = result;
      storage.setItem("user", JSON.stringify(data), "SESSION");
      window.history.replaceState({}, "", window.location.origin);
    }
  }

  return (
    <>
      {sessionActive ? (
        <ModalProvider>
          <DndProvider backend={HTML5Backend}>
            <Header result={result} />
            <Main />
          </DndProvider>
        </ModalProvider>
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

export default App;
