import { useContext, useState } from "react";
import ModulosSystemList from "../components/ModulosSystem";
import ModulosSystemCreate from "../components/ModulosSystemCreate";
import ModulosSystemEdit from "../components/ModulosSystemEdit";
import { ModalContext } from "../../../store/context/dialogContext";
import { IModulosSystem } from "../../../interfaces/features/modulo/modulo_system.interface";
import { DialogEnum } from "../../../types/enums/dialog.enum";

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
      {dialogState.nameDialog === DialogEnum.DIALOG_MODULE_SYSTEM && (
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
