import { devtools } from "zustand/middleware";
import { INITIAL_VALUE_PAGINATION } from "../../config/constants";
import { create } from "zustand";
import { PaginationState } from "@tanstack/react-table";

type PaginationStoreState = {
  pagination: PaginationState;
};

type PaginationStoreActions = {
  setPagination: (
    currentPag:
      | PaginationStoreState["pagination"]
      | ((
          currentTab: PaginationStoreState["pagination"]
        ) => PaginationStoreState["pagination"])
  ) => void;
};

type PaginationStore = PaginationStoreState & PaginationStoreActions;

export const usePaginationStore = create<PaginationStore>()(
  devtools(
    (set) => ({
      pagination: INITIAL_VALUE_PAGINATION,
      setPagination: (currentPag) => {
        set((state) => ({
          pagination:
            typeof currentPag === "function"
              ? currentPag(state.pagination)
              : currentPag,
        }));
      },
    }),
    {
      enabled: true,
    }
  )
);
