import { io, SocketOptions, ManagerOptions } from "socket.io-client";
import { BASE_URL_WS } from "./const";

const URL = BASE_URL_WS;

type SocketOption = Partial<ManagerOptions & SocketOptions>;

const options: SocketOption = {
  autoConnect: false,
  reconnectionDelay: 5000,
  reconnectionAttempts: 2,
};

export const socketInvoices = io(`${URL}/invoices`, options);
export const socketNotify = io(`${URL}/notify`, options);
