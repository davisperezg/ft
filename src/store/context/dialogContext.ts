import { createContext } from "react";
import { DialogState } from "../../interfaces/common/dialog.interface";
import { INITIAL_VALUE_DIALOG } from "../../config/constants";

export const ModalContext = createContext<{
  dialogState: DialogState;
  dispatch: React.Dispatch<any>;
}>({
  dialogState: INITIAL_VALUE_DIALOG,
  dispatch: () => null,
});
