import { useContext, useState } from "react";
import ModulosSystemList from "../components/System/ModulosSystem";
import ModulosSystemCreate from "../components/System/ModulosSystemCreate";
import ModulosSystemEdit from "../components/System/ModulosSystemEdit";
import { ModalContext } from "../context/modalContext";
import { IModulosSystem } from "../interface/modulo_system.interface";
import { DialogActionKind } from "../reducers/dialogReducer";

const ModulosScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const openEdit = (value: boolean, row: IModulosSystem) => {
    setState({ visible: value, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogActionKind.DIALOG_MODULE_SYSTEM && (
        <ModulosSystemCreate />
      )}

      {state.visible && (
        <ModulosSystemEdit data={state.row} closeEdit={closeEdit} />
      )}
      <ModulosSystemList openEdit={openEdit} />
    </>
  );
};

export default ModulosScreen;
