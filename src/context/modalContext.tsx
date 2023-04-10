import React, { createContext, useEffect, useReducer, useState } from "react";
import {
  dialogReducer,
  DialogState,
  initialValueDialog,
} from "../reducers/dialogReducer";
import { storage } from "../utils/storage";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

export const ModalContext = createContext<{
  dialogState: DialogState;
  dispatch: React.Dispatch<any>;
  userGlobal: any;
  setUserGlobal: React.Dispatch<React.SetStateAction<null>>;
}>({
  dialogState: initialValueDialog,
  dispatch: () => null,
  userGlobal: null,
  setUserGlobal: () => null,
});

export const ModalProvider = ({ children }: Prop) => {
  const [dialogState, dispatch] = useReducer(dialogReducer, initialValueDialog);
  const [userGlobal, setUserGlobal] = useState(null);

  useEffect(() => {
    if (storage.getItem("user", "SESSION")) {
      const initialValue = JSON.parse(storage.getItem("user", "SESSION") ?? "");
      setUserGlobal(initialValue);
    }
  }, [storage]);

  return (
    <ModalContext.Provider
      value={{ dialogState, dispatch, userGlobal, setUserGlobal }}
    >
      {children}
    </ModalContext.Provider>
  );
};
