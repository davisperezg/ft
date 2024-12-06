import { useContext, useState } from "react";
import ResourceCreate from "../components/ResourceCreate";
import ResourceEdit from "../components/ResourceEdit";
import ResourceList from "../components/ResourceList";
import { ModalContext } from "../../../store/context/dialogContext";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { IPermisos } from "../../../interfaces/models/permisos/permisos.interface";

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
      {dialogState.nameDialog === DialogEnum.DIALOG_RESORUCE && (
        <ResourceCreate />
      )}

      {state.visible && <ResourceEdit data={state.row} closeEdit={closeEdit} />}

      <ResourceList openEdit={openEdit} />
    </>
  );
};

export default PermisosScreen;
