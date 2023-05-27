import { useContext, useState } from "react";
import RolCreate from "../components/Rol/RolCreate";
import RolEdit from "../components/Rol/RolEdit";
import RolList from "../components/Rol/RolList";
import UserCreate from "../components/User/UserCreate";
import { ModalContext } from "../context/modalContext";
import { IRol } from "../interface/rol.interface";
import { DialogActionKind } from "../reducers/dialogReducer";

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
      {dialogState.nameDialog === DialogActionKind.DIALOG_ROLE && <RolCreate />}
      {state.visible && <RolEdit data={state.row} closeEdit={closeEdit} />}
      <RolList openEdit={openEdit} />
    </>
  );
};

export default RolesScreen;
