import axios from "axios";
import { IMenuSystem } from "../interface/menu_system.interface";
import { BASE_API } from "../utils/const";

export const getMenus = async () => {
  const { data } = await axios.get<IMenuSystem[]>(`${BASE_API}/api/v1/menus`);
  return data;
};
