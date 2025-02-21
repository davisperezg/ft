import { useContext, useState } from "react";
import UserCreate from "./UserCreatePage";
import UserEdit from "./UserEditPage";
import UserList from "../components/UserList";
import { ModalContext } from "../../../store/context/dialogContext";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { IUser } from "../../../interfaces/models/user/user.interface";
import { isError } from "../../../utils/functions.utils";
import { toast } from "sonner";
import { useDeleteUser, useRestoreUser } from "../hooks/useUsers";

const UserScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const { mutateAsync: mutateDelete } = useDeleteUser();

  const { mutateAsync: mutateRestore } = useRestoreUser();

  const getItemsRemoves = async (item: any) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${item.username} items ?`
    );

    try {
      if (eliminar) {
        await mutateDelete({ id: item._id });
      }
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const getItemsRestores = async (item: any) => {
    const restaurar = confirm(
      `Esta seguro que desea restaurar ${item.username} items ?`
    );

    try {
      if (restaurar) {
        await mutateRestore({ id: item._id });
      }
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const onRowClick = (row: IUser) => {
    setState({ visible: true, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogEnum.DIALOG_USER && <UserCreate />}
      {state.visible && <UserEdit state={state} closeEdit={closeEdit} />}
      <UserList
        onRowClick={onRowClick}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
      />
    </>
  );
};

export default UserScreen;
