import React, { createContext, useReducer, useState } from "react";
import {
  dialogReducer,
  DialogState,
  initialValueDialog,
} from "../reducers/dialogReducer";
import { initialMenuContext } from "../utils/initials";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

interface IMenuSelected {
  estado: boolean;
  nombre: string;
  modulo: string;
}

export const ModalContext = createContext<{
  dialogState: DialogState;
  dispatch: React.Dispatch<any>;
  menuContext: IMenuSelected;
  setMenuContext: React.Dispatch<React.SetStateAction<IMenuSelected>>;
}>({
  dialogState: initialValueDialog,
  dispatch: () => null,
  menuContext: initialMenuContext,
  setMenuContext: () => null,
});

export const ModalProvider = ({ children }: Prop) => {
  const [dialogState, dispatch] = useReducer(dialogReducer, initialValueDialog);
  const [menuContext, setMenuContext] =
    useState<IMenuSelected>(initialMenuContext);

  return (
    <ModalContext.Provider
      value={{ dialogState, dispatch, menuContext, setMenuContext }}
    >
      {children}
    </ModalContext.Provider>
  );
};
