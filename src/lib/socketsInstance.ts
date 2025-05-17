import { io, Socket, ManagerOptions, SocketOptions } from "socket.io-client";
import { BASE_URL_WS } from "../config/constants";
import { storage } from "../utils/storage.utils";

const URL = BASE_URL_WS;

type SocketOption = Partial<ManagerOptions & SocketOptions>;

// Better reconnection settings
const options: SocketOption = {
  autoConnect: false, // We'll connect manually when we have all data
  reconnection: true,
  reconnectionAttempts: Infinity, // Keep trying to reconnect
  reconnectionDelay: 1000, // Start with 1s delay
  reconnectionDelayMax: 5000, // Max 5s between retries
  timeout: 20000, // Longer timeout for initial connection
};

// Create socket instance but don't connect yet
export const socketInvoices = io(`${URL}/invoices`, options);

// Setup socket with authentication and connection management
export const setupSocket = () => {
  // Get latest credentials
  const token = storage.getItem("access_token", "SESSION");
  const empresa = JSON.parse(String(storage.getItem("empresaActual", "SESSION") || "{}"));

  if (!token || !empresa?.id) {
    console.warn("Missing authentication data for socket connection");
    return false;
  }

  // Set auth data
  socketInvoices.auth = {
    token: `Bearer ${token}`,
  };

  // Set query parameters
  socketInvoices.io.opts.query = {
    "empresa-id": String(empresa?.id),
    "establecimiento-id": String(empresa?.establecimiento?.id),
  };

  // Connect if not already connected
  if (socketInvoices.disconnected) {
    socketInvoices.connect();
    console.log("Socket connecting with fresh credentials");
  }

  return true;
};

// Reset and reconnect socket with fresh credentials
export const refreshSocketConnection = async () => {
  if (socketInvoices.connected) {
    socketInvoices.disconnect();
  }
  return setupSocket();
};
