import { useEffect, useReducer } from "react";
import { dialogReducer } from "../store/reducers/dialogReducer";
import { INITIAL_VALUE_DIALOG } from "../config/constants";
import { storage } from "../utils/storage.utils";
import { ModalContext } from "../store/context/dialogContext";
import { useUserStore } from "../store/zustand/user-zustand";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

export const ModalProvider = ({ children }: Prop) => {
  const [dialogState, dispatch] = useReducer(
    dialogReducer,
    INITIAL_VALUE_DIALOG
  );
  const setUserGlobal = useUserStore((state) => state.setUserGlobal);

  useEffect(() => {
    if (storage.getItem("user", "SESSION")) {
      const initialValue = JSON.parse(storage.getItem("user", "SESSION") ?? "");
      setUserGlobal(initialValue);
    }
  }, []);

  return (
    <ModalContext.Provider
      value={{
        dialogState,
        dispatch,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
