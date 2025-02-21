import { useContext, useState } from "react";
import RolCreate from "../components/RolCreate";
import RolEdit from "../components/RolEdit";
import RolList from "../components/RolList";
import { ModalContext } from "../../../store/context/dialogContext";
import { IRol } from "../../../interfaces/models/rol/rol.interface";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { isError } from "../../../utils/functions.utils";
import { toast } from "sonner";
import { useDeleteRol, useRestoreRol } from "../hooks/useRoles";

const RolesScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const { mutateAsync: mutateDelete } = useDeleteRol();
  const { mutateAsync: mutateRestore } = useRestoreRol();

  const getItemsRemoves = async (items: any[]) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${items.length} items ?`
    );

    if (eliminar) {
      for (const item of items) {
        try {
          await mutateDelete({ id: item.original._id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

  const getItemsRestores = async (items: any[]) => {
    const restaurar = confirm(
      `Esta seguro que desea restaurar ${items.length} items ?`
    );

    if (restaurar) {
      for (const item of items) {
        try {
          await mutateRestore({ id: item.original._id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

  const onRowClick = (row: IRol) => {
    setState({ visible: true, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogEnum.DIALOG_ROLE && <RolCreate />}
      {state.visible && <RolEdit state={state} closeEdit={closeEdit} />}
      <RolList
        onRowClick={onRowClick}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
      />
    </>
  );
};

export default RolesScreen;
