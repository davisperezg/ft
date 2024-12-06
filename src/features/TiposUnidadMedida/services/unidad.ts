import axios from "axios";
import { IUnidades } from "../../../interfaces/models/unidades-medida/unidades.interface";
import { BASE_API } from "../../../config/constants";

export const getUnidades = async () => {
  const { data } = await axios.get<IUnidades[]>(`${BASE_API}/api/v1/unidades`);
  return data;
};
