import { DndProvider } from "react-dnd";
import { ModalProvider } from "./dialogProvider";
import { HTML5Backend } from "react-dnd-html5-backend";
import { JSX } from "react";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

const AppProviders = ({ children }: Prop) => (
  <ModalProvider>
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  </ModalProvider>
);

export default AppProviders;
