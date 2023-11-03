import { useContext, useState } from "react";
import { ModalContext } from "../context/modalContext";
import { DialogActionKind } from "../reducers/dialogReducer";
import { IEmpresa } from "../interface/empresa.interface";
import EmpresaEdit from "../components/Empresa/EmpresaEdit";
import EmpresaList from "../components/Empresa/EmpresaList";
import EmpresaCreate from "../components/Empresa/EmpresaCreate";

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
      {dialogState.nameDialog === DialogActionKind.DIALOG_EMPRESA && (
        <EmpresaCreate />
      )}

      {state.visible && <EmpresaEdit data={state.row} closeEdit={closeEdit} />}

      <EmpresaList openEdit={openEdit} />
    </>
  );
};

export default EmpresasScreen;
