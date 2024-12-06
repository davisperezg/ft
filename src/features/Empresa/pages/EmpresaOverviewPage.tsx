import { useContext, useState } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import EmpresaEdit from "./EmpresaEdit";
import EmpresaList from "../components/EmpresaList";
import EmpresaCreate from "./EmpresaCreate";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { IEmpresa } from "../../../interfaces/models/empresa/empresa.interface";

const EmpresasScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState<{ visible: boolean; row: any }>({
    visible: false,
    row: {},
  });

  const openEdit = (value: boolean, row: IEmpresa) => {
    setState({ visible: value, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogEnum.DIALOG_EMPRESA && (
        <EmpresaCreate />
      )}

      {state.visible && <EmpresaEdit data={state.row} closeEdit={closeEdit} />}

      <EmpresaList openEdit={openEdit} />
    </>
  );
};

export default EmpresasScreen;
