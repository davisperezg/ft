import { devtools } from "zustand/middleware";
import { create } from "zustand";
import { INITIAL_VALUE_PAGE } from "../../config/constants";
import { PageState } from "../../interfaces/common/page.interface";

interface PageStoreState {
  page: PageState;
}

interface PageStoreActions {
  setPage: (
    currentPag:
      | PageStoreState["page"]
      | ((currentTab: PageStoreState["page"]) => PageStoreState["page"])
  ) => void;
}

type PageStore = PageStoreState & PageStoreActions;

export const usePageStore = create<PageStore>()(
  devtools(
    (set) => ({
      page: INITIAL_VALUE_PAGE,
      setPage: (currentPag) => {
        set((state) => ({
          page:
            typeof currentPag === "function"
              ? currentPag(state.page)
              : currentPag,
        }));
      },
    }),
    {
      enabled: true,
      name: "page store",
    }
  )
);
