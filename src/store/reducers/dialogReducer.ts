import { INITIAL_VALUE_DIALOG } from "../../config/constants";
import {
  DialogActions,
  DialogState,
} from "../../interfaces/common/dialog.interface";
import { DialogEnum } from "../../types/enums/dialog.enum";

export const dialogReducer = (state: DialogState, action: DialogActions) => {
  switch (action.type) {
    case DialogEnum.INIT:
      return INITIAL_VALUE_DIALOG;

    case DialogEnum.DIALOG_USER:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_USER",
      };

    case DialogEnum.DIALOG_RESORUCE:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_RESORUCE",
      };

    case DialogEnum.DIALOG_MODULE_SYSTEM:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_MODULE_SYSTEM",
      };

    case DialogEnum.DIALOG_ROLE:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_ROLE",
      };

    case DialogEnum.DIALOG_TIPODOC:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_TIPODOC",
      };

    case DialogEnum.DIALOG_EMPRESA:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_EMPRESA",
      };

    case DialogEnum.DIALOG_SERIES:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_SERIES",
      };

    case DialogEnum.DIALOG_SERIES_MIGRATE:
      return {
        ...state,
        open: true,
        nameDialog: "DIALOG_SERIES_MIGRATE",
      };

    case DialogEnum.OPEN_EDIT:
      return {
        ...state,
        open: true,
      };

    default:
      return state;
  }
};
