import { useContext, useState } from "react";
import { ModalContext } from "../context/modalContext";
import { ITipoDoc } from "../interface/tipodocs.interface";
import TipoDocsList from "../components/TipoDocs/TipoDocsList";
import { DialogActionKind } from "../reducers/dialogReducer";
import TipoDocsCreate from "../components/TipoDocs/TipoDocsCreate";
import TipoDocsEdit from "../components/TipoDocs/TipoDocsEdit";

const TipoDocsScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState<{ visible: boolean; row: any }>({
    visible: false,
    row: {},
  });

  const openEdit = (value: boolean, row: ITipoDoc) => {
    setState({ visible: value, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogActionKind.DIALOG_TIPODOC && (
        <TipoDocsCreate />
      )}

      {state.visible && <TipoDocsEdit data={state.row} closeEdit={closeEdit} />}

      <TipoDocsList openEdit={openEdit} />
    </>
  );
};

export default TipoDocsScreen;
