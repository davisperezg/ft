import { DialogEnum } from "../../types/enums/dialog.enum";

export interface DialogState {
  open: boolean;
  nameDialog: string;
  origen?: any;
  payload?: any;
}

export interface DialogActions {
  type: DialogEnum;
  payload?: any;
  // payload: values
}
