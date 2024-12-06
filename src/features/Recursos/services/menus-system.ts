import axios from "axios";
import { IMenuSystem } from "../../../interfaces/features/recurso/menu_system.interface";
import { BASE_API } from "../../../config/constants";

export const getMenus = async () => {
  const { data } = await axios.get<IMenuSystem[]>(`${BASE_API}/api/v1/menus`);
  return data;
};
