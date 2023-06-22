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
  modulesGlobal: any;
  setModulesGlobal: React.Dispatch<React.SetStateAction<any>>;
  clickedTab: number;
  setClickedGlobal: React.Dispatch<React.SetStateAction<number>>;
}>({
  dialogState: initialValueDialog,
  dispatch: () => null,
  userGlobal: null,
  setUserGlobal: () => null,
  modulesGlobal: null,
  setModulesGlobal: () => null,
  clickedTab: 0,
  setClickedGlobal: () => null,
});

export const ModalProvider = ({ children }: Prop) => {
  const [dialogState, dispatch] = useReducer(dialogReducer, initialValueDialog);
  const [userGlobal, setUserGlobal] = useState(null);
  const [modulesGlobal, setModulesGlobal] = useState();
  const [clickedTab, setClickedGlobal] = useState<number>(0);

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
        userGlobal,
        setUserGlobal,
        modulesGlobal,
        setModulesGlobal,
        clickedTab,
        setClickedGlobal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
