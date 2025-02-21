import { useContext, useState } from "react";
import ResourceCreate from "../components/ResourceCreate";
import ResourceEdit from "../components/ResourceEdit";
import ResourceList from "../components/ResourceList";
import { ModalContext } from "../../../store/context/dialogContext";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { IPermisos } from "../../../interfaces/models/permisos/permisos.interface";
import { isError } from "../../../utils/functions.utils";
import { toast } from "sonner";
import {
  useActivateResources,
  useDesactivateResources,
} from "../hooks/useResources";

const PermisosScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState({
    visible: false,
    row: {},
  });

  const { mutateAsync: mutateDesact } = useDesactivateResources();
  const { mutateAsync: mutateAct } = useActivateResources();

  const getItemsRemoves = async (items: any[]) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${items.length} items ?`
    );

    if (eliminar) {
      for (const item of items) {
        try {
          await mutateDesact({ id: item.original._id });
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
          await mutateAct({ id: item.original._id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

  const onRowClick = (row: IPermisos) => {
    setState({ visible: true, row });
  };

  const closeEdit = () => setState({ visible: false, row: {} });

  return (
    <>
      {dialogState.nameDialog === DialogEnum.DIALOG_RESORUCE && (
        <ResourceCreate />
      )}

      {state.visible && <ResourceEdit state={state} closeEdit={closeEdit} />}

      <ResourceList
        onRowClick={onRowClick}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
      />
    </>
  );
};

export default PermisosScreen;
