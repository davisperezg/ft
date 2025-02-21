import { useContext, useState } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import TipoDocsList from "../components/TipoDocsList";
import TipoDocsCreate from "../components/TipoDocsCreate";
import TipoDocsEdit from "../components/TipoDocsEdit";
import { ITipoDoc } from "../../../interfaces/features/tipo-docs-cpe/tipo-docs.interface";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { useDisableTipDoc, useEnableTipDoc } from "../hooks/useTipoDocs";
import { isError } from "../../../utils/functions.utils";
import { toast } from "sonner";

const TipoDocsScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState<{ visible: boolean; row: any }>({
    visible: false,
    row: {},
  });

  const { mutateAsync: mutateDisable } = useDisableTipDoc();
  const { mutateAsync: mutateEnable } = useEnableTipDoc();

  const onRowClick = (row: ITipoDoc) => {
    setState({ visible: true, row });
  };

  const closeEdit = () => setState({ visible: false, row: {} });

  const getItemsRemoves = async (items: any) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${items.length} items ?`
    );

    if (eliminar) {
      for (const item of items) {
        try {
          await mutateDisable({ id: item.original.id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

  const getItemsRestores = async (items: any) => {
    const restaurar = confirm(
      `Esta seguro que desea restaurar ${items.length} items ?`
    );

    if (restaurar) {
      for (const item of items) {
        try {
          await mutateEnable({ id: item.original.id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

  return (
    <>
      {dialogState.nameDialog === DialogEnum.DIALOG_TIPODOC && (
        <TipoDocsCreate />
      )}

      {state.visible && <TipoDocsEdit state={state} closeEdit={closeEdit} />}

      <TipoDocsList
        onRowClick={onRowClick}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
      />
    </>
  );
};

export default TipoDocsScreen;
