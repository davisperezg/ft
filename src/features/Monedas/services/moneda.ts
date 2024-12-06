import axios from "axios";
import { BASE_API } from "../../../config/constants";
import { IMoneda } from "../../../interfaces/models/tipo-moneda/moneda.interface";

export const getMonedas = async () => {
  const { data } = await axios.get<IMoneda[]>(`${BASE_API}/api/v1/monedas`);
  return data;
};
