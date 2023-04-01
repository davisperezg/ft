export enum DialogActionKind {
  INIT = "INIT",
  DIALOG_USER = "DIALOG_USER",
  DIALOG_RESORUCE = "DIALOG_RESORUCE",
}

export interface DialogState {
  open: boolean;
  nameDialog: string;
}

interface DialogActions {
  type: DialogActionKind;
  // payload: values
}

export const initialValueDialog: DialogState = {
  open: false,
  nameDialog: "",
};

export const dialogReducer = (state: DialogState, action: DialogActions) => {
  switch (action.type) {
    case DialogActionKind.INIT:
      return initialValueDialog;

    case DialogActionKind.DIALOG_USER:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_USER",
      };

    case DialogActionKind.DIALOG_RESORUCE:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_RESORUCE",
      };

    default:
      return state;
  }
};
