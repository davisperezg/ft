import axios from "axios";
import { ITipoEntidades } from "../../../interfaces/models/tipo-docs-identidad/tipo_entidades.interface";
import { BASE_API } from "../../../config/constants";

export const getTipoEntidades = async () => {
  const { data } = await axios.get<ITipoEntidades[]>(
    `${BASE_API}/api/v1/tipo-entidades`
  );
  return data;
};
