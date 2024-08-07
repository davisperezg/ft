export enum DialogActionKind {
  INIT = "INIT",
  DIALOG_USER = "DIALOG_USER",
  DIALOG_RESORUCE = "DIALOG_RESORUCE",
  DIALOG_MODULE_SYSTEM = "DIALOG_MODULE_SYSTEM",
  DIALOG_ROLE = "DIALOG_ROLE",
  DIALOG_TIPODOC = "DIALOG_TIPODOC",
  DIALOG_EMPRESA = "DIALOG_EMPRESA",
  DIALOG_SERIES = "DIALOG_SERIES",
  DIALOG_SERIES_MIGRATE = "DIALOG_SERIES_MIGRATE",
  OPEN_EDIT = "OPEN_EDIT",
  SCREEN_FACTURA = "SCREEN_FACTURA",
  SCREEN_BOLETA = "SCREEN_BOLETA",
  //OPEN_EDIT_ROL = "OPEN_EDIT_ROL",
}

export interface DialogState {
  open: boolean;
  nameDialog: string;
  origen?: any;
  pageComplete?: boolean;
  payload?: any;
}

interface DialogActions {
  type: DialogActionKind;
  payload?: any;
  // payload: values
}

export const initialValueDialog: DialogState = {
  open: false,
  nameDialog: "",
  pageComplete: false,
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

    case DialogActionKind.DIALOG_SERIES:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_SERIES",
      };

    case DialogActionKind.DIALOG_SERIES_MIGRATE:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_SERIES_MIGRATE",
      };

    case DialogActionKind.SCREEN_FACTURA:
      return {
        ...state,
        payload: action.payload,
        open: true,
        pageComplete: true,
        nameDialog: "SCREEN_FACTURA",
      };

    case DialogActionKind.SCREEN_BOLETA:
      return {
        ...state,
        open: true,
        nameDialog: "SCREEN_BOLETA",
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
