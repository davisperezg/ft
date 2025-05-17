import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { storage } from "../utils/storage.utils";
import { toast } from "sonner";
import { getRefresh } from "../features/Authentication/services/auth.service";
import { refreshSocketConnection, setupSocket, socketInvoices } from "../lib/socketsInstance";

export const useSocketInvoice = () => {
  const [reconnecting, setReconnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Update token periodically or when needed
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
        const newToken = resToken.data.access_token;
        storage.setItem("access_token", newToken, "SESSION");

        // Refresh socket connection with new token
        await refreshSocketConnection();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize socket on component mount
  useEffect(() => {
    const initializeSocket = () => {
      const isSetup = setupSocket();
      if (isSetup) {
        setSocket(socketInvoices);
      } else {
        // If setup failed due to missing credentials, try getting a fresh token
        updateToken();
      }
    };

    initializeSocket();

    // Check if we have the required storage data
    const checkStorageData = setInterval(() => {
      const hasToken = !!storage.getItem("access_token", "SESSION");
      const hasEmpresa = !!storage.getItem("empresaActual", "SESSION");

      if (!hasToken || !hasEmpresa) {
        console.warn("Missing required storage data, attempting recovery");
        storage.clear("SESSION");
        window.location.reload();
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(checkStorageData);
    };
  }, [updateToken]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReconnectAttempt = (attempt: number) => {
      console.log(`Socket reconnection attempt: ${attempt}`);
      setReconnecting(true);
    };

    const handleReconnect = (attempt: number) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
      setReconnecting(false);
      // We successfully reconnected, so make sure our token is up to date
      updateToken();
    };

    const handleDisconnect = (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);

      // If the server closed the connection, try to reconnect with fresh credentials
      if (reason === "io server disconnect") {
        refreshSocketConnection();
      }

      // If the socket disconnected due to transport close (server restart)
      if (reason === "transport close") {
        // Socket.IO will automatically try to reconnect
        setReconnecting(true);
      }
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error.message);

      // If we get authentication errors, try refreshing the token
      if (error.message.includes("auth") || error.message.includes("jwt")) {
        updateToken();
      }
    };

    const handleError = (data: any) => {
      console.error("Socket error:", data);

      if (data.message === "jwt expired") {
        toast.warning("Your session has expired. Refreshing...");
        updateToken().then((success) => {
          if (!success) {
            // If token refresh failed, redirect to login
            storage.clear("SESSION");
            window.location.reload();
          }
        });
      }

      if (data.message === "Unauthorized access") {
        toast.error("Unauthorized access");
      }
    };

    // Register event handlers
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleReconnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("error", handleError);

    // Clean up
    return () => {
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleReconnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleError);
    };
  }, [socket, updateToken]);

  // Refresh token periodically
  useEffect(() => {
    // Refresh token every 23 hours to avoid expiration
    const tokenRefreshInterval = setInterval(
      () => {
        console.log("Performing scheduled token refresh");
        updateToken();
      },
      23 * 60 * 60 * 1000
    );

    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, [updateToken]);

  return { socket, reconnecting, loading };
};
