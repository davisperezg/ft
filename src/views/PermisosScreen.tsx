import { useContext, useState } from "react";
import ResourceCreate from "../components/Resources/ResourceCreate";
import ResourceEdit from "../components/Resources/ResourceEdit";
import ResourceList from "../components/Resources/ResourceList";
import { ModalContext } from "../context/modalContext";
import { IPermisos } from "../interface/permisos..interface";
import { DialogActionKind } from "../reducers/dialogReducer";

const PermisosScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const openEdit = (value: boolean, row: IPermisos) => {
    setState({ visible: value, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogActionKind.DIALOG_RESORUCE && (
        <ResourceCreate />
      )}

      {state.visible && <ResourceEdit data={state.row} closeEdit={closeEdit} />}

      <ResourceList openEdit={openEdit} />
    </>
  );
};

export default PermisosScreen;
