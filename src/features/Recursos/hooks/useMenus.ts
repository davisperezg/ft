import { useQuery } from "@tanstack/react-query";
import { getMenus } from "../services/menus-system";
import { IError } from "../../../interfaces/common/error.interface";
import { IMenuSystem } from "../../../interfaces/features/recurso/menu_system.interface";

const KEY = "menus_system";

export const useMenus = () => {
  return useQuery<IMenuSystem[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getMenus(),
  });
};
