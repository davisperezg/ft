import axios from "axios";
import { BASE_API } from "../utils/const";
import { IMoneda } from "../interface/moneda.interface";

export const getMonedas = async () => {
  const { data } = await axios.get<IMoneda[]>(`${BASE_API}/api/v1/monedas`);
  return data;
};
