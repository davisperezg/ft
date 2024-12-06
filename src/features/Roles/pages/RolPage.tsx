import { useContext, useState } from "react";
import RolCreate from "../components/RolCreate";
import RolEdit from "../components/RolEdit";
import RolList from "../components/RolList";
import { ModalContext } from "../../../store/context/dialogContext";
import { IRol } from "../../../interfaces/models/rol/rol.interface";
import { DialogEnum } from "../../../types/enums/dialog.enum";

const RolesScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const openEdit = (value: boolean, row: IRol) => {
    setState({ visible: value, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogEnum.DIALOG_ROLE && <RolCreate />}
      {state.visible && <RolEdit data={state.row} closeEdit={closeEdit} />}
      <RolList openEdit={openEdit} />
    </>
  );
};

export default RolesScreen;
