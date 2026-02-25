import { create } from "zustand";
import { ITabItem } from "../../interfaces/components/tab-top/tab.interface";
import { devtools } from "zustand/middleware";
import { persist } from "zustand/middleware";

interface TabStoreState {
  tabs: ITabItem[];
  menuSelected: string;
}

interface TabStoreActions {
  setTabs: (currentTab: TabStoreState["tabs"] | ((currentTab: TabStoreState["tabs"]) => TabStoreState["tabs"])) => void;
  setMenuSelected: (
    currentMenu:
      | TabStoreState["menuSelected"]
      | ((currentMenu: TabStoreState["menuSelected"]) => TabStoreState["menuSelected"])
  ) => void;
}

type TabStore = TabStoreState & TabStoreActions;

export const useTabStore = create<TabStore>()(
  persist(
    devtools(
      (set) => ({
        tabs: [],
        menuSelected: "",
        setTabs: (currentTab) => {
          set((state) => ({
            tabs: typeof currentTab === "function" ? currentTab(state.tabs) : currentTab,
          }));
        },
        setMenuSelected: (currentMenu) => {
          set((state) => ({
            menuSelected: typeof currentMenu === "function" ? currentMenu(state.menuSelected) : currentMenu,
          }));
        },
      }),
      {
        enabled: true,
        name: "tabs store",
      }
    ),
    {
      name: "tab-storage", // unique name
    }
  )
);
