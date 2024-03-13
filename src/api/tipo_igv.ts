import axios from "axios";
import { BASE_API } from "../utils/const";
import { ITipoIgv } from "../interface/tipo_igv.interface";

export const getTipoIgvs = async () => {
  const { data } = await axios.get<ITipoIgv[]>(`${BASE_API}/api/v1/igvs`);
  return data;
};
