import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { DialogActionKind } from "../../reducers/dialogReducer";
import UserCreate from "../User/UserCreate";

const ContentDialogs = () => {
  const { dialogState } = useContext(ModalContext);

  return (
    <>
      {dialogState.open &&
        dialogState.nameDialog === DialogActionKind.DIALOG_RESORUCE && (
          <UserCreate />
        )}
    </>
  );
};

export default ContentDialogs;
