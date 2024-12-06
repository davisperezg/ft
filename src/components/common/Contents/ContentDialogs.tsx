import { useContext } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import UserCreate from "../../../features/Users/pages/UserCreatePage";
import { DialogEnum } from "../../../types/enums/dialog.enum";

const ContentDialogs = () => {
  const { dialogState } = useContext(ModalContext);

  return (
    <>
      {dialogState.open &&
        dialogState.nameDialog === DialogEnum.DIALOG_RESORUCE && <UserCreate />}
    </>
  );
};

export default ContentDialogs;
