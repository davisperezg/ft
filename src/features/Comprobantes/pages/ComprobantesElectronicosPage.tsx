import CPEList from "../components/ComprobanteList";
import { ModalContext } from "../../../store/context/dialogContext";
import { useContext } from "react";

const CPEScreen = () => {
  const { dialogState } = useContext(ModalContext);

  return (
    <>
      {dialogState.nameDialog === "" && <CPEList />}

      {/* {dialogState.nameDialog === DialogActionKind.SCREEN_FACTURA && (
        <FacturaScreen />
      )} */}
    </>
  );
};

export default CPEScreen;
