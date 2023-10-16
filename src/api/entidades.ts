import axios from "axios";
import { BASE_API } from "../utils/const";
import {
  IDepartamento,
  IDistrito,
  IProvincia,
} from "../interface/entidades.interface";

export const getDepartamentos = async () => {
  const { data } = await axios.get<IDepartamento[]>(
    `${BASE_API}/api/v1/entidades/departamentos`
  );
  return data;
};

export const getProvincias = async (idDepartamento: string) => {
  const { data } = await axios.get<IProvincia[]>(
    `${BASE_API}/api/v1/entidades/provincias/departamento/${idDepartamento}`
  );
  return data;
};

export const getDistritos = async (idProvincia: string) => {
  const { data } = await axios.get<IDistrito[]>(
    `${BASE_API}/api/v1/entidades/distritos/provincia/${idProvincia}`
  );
  return data;
};
