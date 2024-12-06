import { useContext, useState } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import TipoDocsList from "../components/TipoDocsList";
import TipoDocsCreate from "../components/TipoDocsCreate";
import TipoDocsEdit from "../components/TipoDocsEdit";
import { ITipoDoc } from "../../../interfaces/models/tipo-docs-cpe/tipodocs.interface";
import { DialogEnum } from "../../../types/enums/dialog.enum";

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
      {dialogState.nameDialog === DialogEnum.DIALOG_TIPODOC && (
        <TipoDocsCreate />
      )}

      {state.visible && <TipoDocsEdit data={state.row} closeEdit={closeEdit} />}

      <TipoDocsList openEdit={openEdit} />
    </>
  );
};

export default TipoDocsScreen;
