import { DndProvider } from "react-dnd";
import { ModalProvider } from "./dialogProvider";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PageProvider } from "./pageProvider";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

const AppProviders = ({ children }: Prop) => (
  <ModalProvider>
    <PageProvider>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </PageProvider>
  </ModalProvider>
);

export default AppProviders;
