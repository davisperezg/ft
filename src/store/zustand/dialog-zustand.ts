import { devtools } from "zustand/middleware";
import { create } from "zustand";
import { DialogState } from "../../interfaces/common/dialog.interface";
import { INITIAL_VALUE_DIALOG } from "../../config/constants";

interface DialogStoreState {
  dialog: DialogState;
}

interface PaginationStoreActions {
  setDialog: (
    currentPag:
      | DialogStoreState["dialog"]
      | ((currentTab: DialogStoreState["dialog"]) => DialogStoreState["dialog"])
  ) => void;
}

type DialogStore = DialogStoreState & PaginationStoreActions;

export const useDialogStore = create<DialogStore>()(
  devtools(
    (set) => ({
      dialog: INITIAL_VALUE_DIALOG,
      setDialog: (currentPag) => {
        set((state) => ({
          dialog:
            typeof currentPag === "function"
              ? currentPag(state.dialog)
              : currentPag,
        }));
      },
    }),
    {
      enabled: true,
      name: "dialog store",
    }
  )
);
