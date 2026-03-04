import { devtools } from "zustand/middleware";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ClickedStoreState {
  clicked: number;
}

interface ClickedStoreActions {
  setClicked: (
    currentClicked:
      | ClickedStoreState["clicked"]
      | ((currentTab: ClickedStoreState["clicked"]) => ClickedStoreState["clicked"])
  ) => void;
}

type ClickedStore = ClickedStoreState & ClickedStoreActions;

export const useClickedStore = create<ClickedStore>()(
  persist(
    devtools(
      (set) => ({
        clicked: 0,
        setClicked: (currentClicked) => {
          set((state) => ({
            clicked: typeof currentClicked === "function" ? currentClicked(state.clicked) : currentClicked,
          }));
        },
      }),
      {
        enabled: true,
        name: "clicked store",
      }
    ),
    {
      name: "clicked-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
