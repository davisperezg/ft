import CPEList from "../components/CPE/CPEList";
import { ModalContext } from "../context/modalContext";
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
