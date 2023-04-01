import React, { createContext, useReducer } from "react";
import {
  dialogReducer,
  DialogState,
  initialValueDialog,
} from "../reducers/dialogReducer";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

export const ModalContext = createContext<{
  dialogState: DialogState;
  dispatch: React.Dispatch<any>;
}>({
  dialogState: initialValueDialog,
  dispatch: () => null,
});

export const ModalProvider = ({ children }: Prop) => {
  const [dialogState, dispatch] = useReducer(dialogReducer, initialValueDialog);

  return (
    <ModalContext.Provider value={{ dialogState, dispatch }}>
      {children}
    </ModalContext.Provider>
  );
};
