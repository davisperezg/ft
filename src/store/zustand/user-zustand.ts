import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IAuthPayload } from "../../interfaces/models/auth/auth.interface";

type UserStoreState = {
  userGlobal: IAuthPayload | null;
};

type UserStoreActions = {
  setUserGlobal: (
    currentTab:
      | UserStoreState["userGlobal"]
      | ((
          currentTab: UserStoreState["userGlobal"]
        ) => UserStoreState["userGlobal"])
  ) => void;
};

type UserStore = UserStoreState & UserStoreActions;

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      userGlobal: null,
      setUserGlobal: (currentUser) => {
        set((state) => ({
          userGlobal:
            typeof currentUser === "function"
              ? currentUser(state.userGlobal)
              : currentUser,
        }));
      },
    }),
    {
      enabled: true,
    }
  )
);
