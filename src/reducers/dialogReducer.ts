export enum DialogActionKind {
  INIT = "INIT",
  DIALOG_USER = "DIALOG_USER",
  DIALOG_RESORUCE = "DIALOG_RESORUCE",
  DIALOG_MODULE_SYSTEM = "DIALOG_MODULE_SYSTEM",
  DIALOG_ROLE = "DIALOG_ROLE",
  DIALOG_TIPODOC = "DIALOG_TIPODOC",
  DIALOG_EMPRESA = "DIALOG_EMPRESA",
  OPEN_EDIT = "OPEN_EDIT",
  //OPEN_EDIT_ROL = "OPEN_EDIT_ROL",
}

export interface DialogState {
  open: boolean;
  nameDialog: string;
  origen?: any;
}

interface DialogActions {
  type: DialogActionKind;
  payload?: {};
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

    case DialogActionKind.DIALOG_MODULE_SYSTEM:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_MODULE_SYSTEM",
      };

    case DialogActionKind.DIALOG_ROLE:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_ROLE",
      };

    case DialogActionKind.DIALOG_TIPODOC:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_TIPODOC",
      };

    case DialogActionKind.DIALOG_EMPRESA:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_EMPRESA",
      };

    case DialogActionKind.OPEN_EDIT:
      return {
        ...state,
        open: true,
      };

    default:
      return state;
  }
};
