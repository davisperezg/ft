import axios from "axios";
import {
  IDepartamento,
  IDistrito,
  IProvincia,
} from "../../../interfaces/models/entidad/entidades.interface";
import { IEntidad } from "../../../interfaces/models/entidad/entidad.interface";
import { BASE_API } from "../../../config/constants";

export const getDepartamentos = async () => {
  const { data } = await axios.get<IDepartamento[]>(
    `${BASE_API}/api/v1/entidades/departamentos`
  );
  return data;
};

export const getProvincias = async () => {
  const { data } = await axios.get<IProvincia[]>(
    `${BASE_API}/api/v1/entidades/provincias`
  );
  return data;
};

export const getDistritos = async () => {
  const { data } = await axios.get<IDistrito[]>(
    `${BASE_API}/api/v1/entidades/distritos`
  );
  return data;
};

//clientes de las empresas
export const getAllEntidadesByEmpresa = async (idEmpresa: number) => {
  const { data } = await axios.get<IEntidad[]>(
    `${BASE_API}/api/v1/entidades/empresa/${idEmpresa}`
  );
  return data;
};

// export const getProvincias = async (idDepartamento: string) => {
//   const { data } = await axios.get<IProvincia[]>(
//     `${BASE_API}/api/v1/entidades/provincias/departamento/${idDepartamento}`
//   );
//   return data;
// };

// export const getDistritos = async (idProvincia: string) => {
//   const { data } = await axios.get<IDistrito[]>(
//     `${BASE_API}/api/v1/entidades/distritos/provincia/${idProvincia}`
//   );
//   return data;
// };
