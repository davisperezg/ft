import { useContext, useState } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import EmpresaEdit from "./EmpresaEdit";
import EmpresaList from "../components/EmpresaList";
import EmpresaCreate from "./EmpresaCreate";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { IDTOEmpresa } from "../../../interfaces/models/empresa/empresa.interface";
import { useDisableEmpresas, useEnableEmpresas } from "../hooks/useEmpresa";
import { isError } from "../../../utils/functions.utils";
import { toast } from "sonner";

const EmpresasScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState<{ visible: boolean; row: any }>({
    visible: false,
    row: {},
  });

  const { mutateAsync: mutateDisable } = useDisableEmpresas();
  const { mutateAsync: mutateEnable } = useEnableEmpresas();

  const onRowClick = (row: IDTOEmpresa) => {
    setState({ visible: true, row });
  };

  const closeEdit = () => setState({ visible: false, row: {} });

  const getItemsRemoves = async (items: any[]) => {
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

  const getItemsRestores = async (items: any[]) => {
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
      {dialogState.nameDialog === DialogEnum.DIALOG_EMPRESA && (
        <EmpresaCreate />
      )}

      {state.visible && <EmpresaEdit state={state} closeEdit={closeEdit} />}

      <EmpresaList
        onRowClick={onRowClick}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
      />
    </>
  );
};

export default EmpresasScreen;
