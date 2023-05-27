import { useContext, useState } from "react";
import UserCreate from "../components/User/UserCreate";
import UserEdit from "../components/User/UserEdit";
import UserList from "../components/User/UserList";
import { ModalContext } from "../context/modalContext";
import { IUser } from "../interface/user.interface";
import { DialogActionKind } from "../reducers/dialogReducer";

const UserScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const openEdit = (value: boolean, row: IUser) => {
    setState({ visible: value, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogActionKind.DIALOG_USER && (
        <UserCreate />
      )}
      {state.visible && <UserEdit data={state.row} closeEdit={closeEdit} />}
      <UserList openEdit={openEdit} />
    </>
  );
};

export default UserScreen;
