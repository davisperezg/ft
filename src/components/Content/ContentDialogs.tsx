import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { DialogActionKind } from "../../reducers/dialogReducer";
import ModulosSystemCreate from "../System/ModulosSystemCreate";
import ModulosSystemEdit from "../System/ModulosSystemEdit";
import UserCreate from "../User/UserCreate";

interface Props {
  children: JSX.Element;
}

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
