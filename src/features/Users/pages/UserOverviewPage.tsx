import { useContext, useState } from "react";
import UserCreate from "./UserCreatePage";
import UserEdit from "./UserEditPage";
import UserList from "../components/UserList";
import { ModalContext } from "../../../store/context/dialogContext";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { IUser } from "../../../interfaces/models/user/user.interface";

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
      {dialogState.nameDialog === DialogEnum.DIALOG_USER && <UserCreate />}
      {state.visible && <UserEdit data={state.row} closeEdit={closeEdit} />}
      <UserList openEdit={openEdit} />
    </>
  );
};

export default UserScreen;
