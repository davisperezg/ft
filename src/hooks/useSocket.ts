import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { storage } from "../utils/storage.utils";
import { toast } from "sonner";
import { getRefresh } from "../features/Authentication/services/auth.service";
import { getSocketInstance, refreshSocketConnection, setupSocket } from "../lib/socketsInstance";

export const useSocket = (namespace: string) => {
  const [reconnecting, setReconnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const updateToken = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(String(storage.getItem("user", "SESSION") || "{}"));
      const refreshToken = storage.getItem("refresh_token", "SESSION");

      if (!user.usuario || !refreshToken) {
        console.error("Missing user or refresh token");
        return false;
      }

      const resToken = await getRefresh(String(user.usuario), String(refreshToken));

      if (resToken.status === 201) {
        storage.setItem("access_token", resToken.data.access_token, "SESSION");
        refreshSocketConnection(namespace);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  // Initialize socket on mount
  useEffect(() => {
    const isSetup = setupSocket(namespace);
    if (isSetup) {
      setSocket(getSocketInstance(namespace));
    } else {
      updateToken();
    }

    const checkStorageData = setInterval(() => {
      const hasToken = !!storage.getItem("access_token", "SESSION");
      const hasEmpresa = !!storage.getItem("empresaActual", "SESSION");

      if (!hasToken || !hasEmpresa) {
        console.warn("Missing required storage data, attempting recovery");
        storage.clear("SESSION");
        window.location.reload();
      }
    }, 60000);

    return () => clearInterval(checkStorageData);
  }, [namespace, updateToken]);

  // Socket lifecycle event handlers
  useEffect(() => {
    if (!socket) return;

    const handleReconnectAttempt = () => setReconnecting(true);

    const handleReconnect = () => {
      setReconnecting(false);
      updateToken();
    };

    const handleDisconnect = (reason: string) => {
      if (reason === "io server disconnect") refreshSocketConnection(namespace);
      if (reason === "transport close") setReconnecting(true);
    };

    const handleConnectError = (error: Error) => {
      if (error.message.includes("auth") || error.message.includes("jwt")) {
        updateToken();
      }
    };

    const handleError = (data: any) => {
      if (data.message === "jwt expired") {
        toast.warning("Your session has expired. Refreshing...");
        updateToken().then((success) => {
          if (!success) {
            storage.clear("SESSION");
            window.location.reload();
          }
        });
      }
      if (data.message === "Unauthorized access") {
        toast.error("Unauthorized access");
      }
    };

    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleReconnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("error", handleError);

    return () => {
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleReconnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleError);
    };
  }, [socket, namespace, updateToken]);

  // Refresh token every 23 hours
  useEffect(() => {
    const interval = setInterval(() => updateToken(), 23 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateToken]);

  return { socket, reconnecting, loading };
};

// Named aliases — backward compatibility
export const useSocketInvoice = () => useSocket("invoices");
