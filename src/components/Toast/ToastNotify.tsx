import { toast } from "react-toastify";

export const toastSucces = (value: string) => {
  return toast.success(value);
};

export const toastError = (message: string) => {
  const verifyMessage = typeof message === "object" ? message[0] : message;

  return toast.error(verifyMessage);
};
