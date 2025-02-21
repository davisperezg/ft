import { useContext, useState } from "react";
import ModulosSystemList from "../components/ModulosSystem";
import ModulosSystemCreate from "../components/ModulosSystemCreate";
import ModulosSystemEdit from "../components/ModulosSystemEdit";
import { ModalContext } from "../../../store/context/dialogContext";
import { IModulosSystem } from "../../../interfaces/features/modulo/modulo_system.interface";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { useDeleteModule, useRestoreModule } from "../hooks/useModuleS";
import { toast } from "sonner";

const ModulosScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const {
    mutateAsync: mutateDelete,
    error: errorDelete,
    isError: isErrorDelete,
  } = useDeleteModule();

  const {
    mutateAsync: mutateRestore,
    error: errorRestore,
    isError: isErrorRestore,
  } = useRestoreModule();

  const getItemsRemoves = async (items: any[]) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${items.length} items ?`
    );

    if (eliminar) {
      for (const item of items) {
        await mutateDelete({ id: item.original._id });
      }
    }
  };

  const getItemsRestores = async (items: any[]) => {
    const restaurar = confirm(
      `Esta seguro que desea restaurar ${items.length} items ?`
    );

    if (restaurar) {
      for (const item of items) {
        await mutateRestore({ id: item.original._id });
      }
    }
  };

  const onRowClick = (row: IModulosSystem) => {
    setState({ visible: true, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {isErrorDelete && toast.error(errorDelete?.response.data.message)}

      {isErrorRestore && toast.error(errorRestore?.response.data.message)}

      {dialogState.nameDialog === DialogEnum.DIALOG_MODULE_SYSTEM && (
        <ModulosSystemCreate />
      )}

      {state.visible && (
        <ModulosSystemEdit state={state} closeEdit={closeEdit} />
      )}

      <ModulosSystemList
        onRowClick={onRowClick}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
      />
    </>
  );
};

export default ModulosScreen;
