import { io, ManagerOptions, SocketOptions } from "socket.io-client";
import { BASE_URL_WS } from "../config/constants";
import { storage } from "../utils/storage.utils";

type SocketOption = Partial<ManagerOptions & SocketOptions>;

const options: SocketOption = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket"],
};

// Singleton registry: one instance per namespace
const instances = new Map<string, ReturnType<typeof io>>();

export const getSocketInstance = (namespace: string) => {
  if (!instances.has(namespace)) {
    instances.set(namespace, io(`${BASE_URL_WS}/${namespace}`, options));
  }
  return instances.get(namespace)!;
};

export const setupSocket = (namespace: string) => {
  const token = storage.getItem("access_token", "SESSION");
  const empresa = JSON.parse(String(storage.getItem("empresaActual", "SESSION") || "{}"));

  if (!token || !empresa?.id) {
    console.warn(`[socket/${namespace}] Missing authentication data`);
    return false;
  }

  const socket = getSocketInstance(namespace);

  socket.auth = { token: `Bearer ${token}` };
  socket.io.opts.query = {
    "empresa-id": String(empresa?.id),
    "establecimiento-id": String(empresa?.establecimiento?.id),
  };

  if (socket.disconnected) {
    socket.connect();
  }

  return true;
};

export const refreshSocketConnection = (namespace: string) => {
  const socket = getSocketInstance(namespace);
  if (socket.connected) socket.disconnect();
  return setupSocket(namespace);
};
