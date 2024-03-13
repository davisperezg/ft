import axios from "axios";
import { BASE_API } from "../utils/const";
import { IUnidades } from "../interface/unidades.interface";

export const getUnidades = async () => {
  const { data } = await axios.get<IUnidades[]>(`${BASE_API}/api/v1/unidades`);
  return data;
};
