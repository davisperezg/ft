import axios from "axios";
import { BASE_API } from "../utils/const";
import { ITipoEntidades } from "../interface/tipo_entidades.interface";

export const getTipoEntidades = async () => {
  const { data } = await axios.get<ITipoEntidades[]>(
    `${BASE_API}/api/v1/tipo-entidades`
  );
  return data;
};
