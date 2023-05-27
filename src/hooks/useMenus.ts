import { useQuery } from "@tanstack/react-query";
import { getMenus } from "../api/menus-system";
import { IError } from "../interface/error.interface";
import { IMenuSystem } from "../interface/menu_system.interface";

const KEY = "menus_system";

export const useMenus = () => {
  return useQuery<IMenuSystem[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getMenus(),
  });
};
