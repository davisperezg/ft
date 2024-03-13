import { useCallback, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { storage } from "../utils/storage";
import { BASE_URL_WS } from "../utils/const";
import { getRefresh } from "../api/auth";
import { socketInvoices } from "../utils/socket";

export const useSocketInvoice = () => {
  const [reconnecting, setReconnecting] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const storageEmpresa = storage.getItem("empresa", "SESSION");
  const storageToken = storage.getItem("access_token", "SESSION");

  const updateToken = useCallback(async () => {
    const user = JSON.parse(String(storage.getItem("user", "SESSION")));
    const refreshToken = storage.getItem("refresh_token", "SESSION");
    const resToken: any = await getRefresh(
      String(user.usuario),
      String(refreshToken)
    );
    if (resToken.status === 201) {
      const newToken = resToken.data.access_token;
      const empresa = JSON.parse(String(storage.getItem("empresa", "SESSION")));

      const newSocket = io(`${BASE_URL_WS}/invoices`, {
        auth: {
          token: `Bearer ${newToken}`,
        },
        query: {
          "empresa-id": String(empresa?.id),
          "establecimiento-id": String(empresa?.establecimiento?.id),
        },
      });
      storage.setItem("access_token", newToken, "SESSION");
      setSocket(newSocket);
    }
  }, []);

  useEffect(() => {
    if (storageEmpresa) {
      const empresa = JSON.parse(String(storage.getItem("empresa", "SESSION")));
      const token = storage.getItem("access_token", "SESSION");
      socketInvoices.auth = {
        token: `Bearer ${token}`,
      };
      socketInvoices.io.opts.query = {
        "empresa-id": String(empresa?.id),
        "establecimiento-id": String(empresa?.establecimiento?.id),
      };

      socketInvoices.connect();
      setSocket(socketInvoices);
    }
  }, [storageEmpresa]);

  useEffect(() => {
    if (socket) {
      socket.on("error", (data: any) => {
        if (data.message === "jwt expired") {
          window.location.reload();
        }
      });

      socket.io.on("reconnect_attempt", function () {
        console.log("reconnecting");
        setReconnecting(true);
      });

      socket.io.on("reconnect", function () {
        console.log("reconnect");
        setReconnecting(false);
      });

      socket.io.on("reconnect_failed", function () {
        console.log("reconnect failed");
        storage.clear("SESSION");
        window.location.reload();
      });

      return () => {
        socket.off("error");
        socket.off("reconnect_attempt");
        socket.off("reconnect");
        socket.off("reconnect_failed");
      };
    }
  }, [socket]);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      updateToken();
    }, 23 * 60 * 60 * 1000); //refresh cada 2min

    return () => {
      clearInterval(intervalo);
    };
  }, [updateToken]);

  useEffect(() => {
    if (!storageToken || !storageEmpresa) {
      window.location.reload();
    }
  }, [storageToken, storageEmpresa]);

  return { socket, reconnecting };
};
