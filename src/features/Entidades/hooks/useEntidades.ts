import { useQuery } from "@tanstack/react-query";

import { IError } from "../../../interfaces/common/error.interface";
import {
  getAllEntidadesByEmpresa,
  getDepartamentos,
  getDistritos,
  getProvincias,
} from "../services/entidades";
import { IEntidad } from "../../../interfaces/models/entidad/entidad.interface";
import {
  IDepartamento,
  IDistrito,
  IProvincia,
} from "../../../interfaces/models/entidad/entidades.interface";

const KEY_DEPARTAMENTOS = "departamentos";
const KEY_PROVINCIAS = "provincias";
const KEY_DISTRITOS = "distritos";
const KEY_ENTIDAD = "clientes";

export const useDepartamentos = () => {
  return useQuery<IDepartamento[], IError>({
    queryKey: [KEY_DEPARTAMENTOS],
    queryFn: async () => await getDepartamentos(),
  });
};

export const useProvincias = () => {
  return useQuery<IProvincia[], IError>({
    queryKey: [KEY_PROVINCIAS],
    queryFn: () => getProvincias(),
  });
};

export const useDistritos = () => {
  return useQuery<IDistrito[], IError>({
    queryKey: [KEY_DISTRITOS],
    queryFn: () => getDistritos(),
  });
};

export const useEntidadesByEmpresa = (idEmpresa: number) => {
  return useQuery<IEntidad[], IError>({
    queryKey: [KEY_ENTIDAD, idEmpresa],
    queryFn: () => getAllEntidadesByEmpresa(idEmpresa),
    enabled: !!idEmpresa,
  });
};

// export const useProvinciasDinamic = (
//   idDinamica: string,
//   idDepartamento = ""
// ) => {
//   return useQuery<IProvincia[], IError>({
//     queryKey: [`${KEY_PROVINCIAS}_${idDinamica}`, idDepartamento],
//     queryFn: () => getProvincias(idDepartamento),
//     enabled: !!idDepartamento,
//     gcTime: Infinity,
//   });
// };

// export const useDistritosDinamic = (idDinamica: string, idProvincia = "") => {
//   return useQuery<IDistrito[], IError>({
//     queryKey: [`${KEY_DISTRITOS}_${idDinamica}`, idProvincia],
//     queryFn: () => getDistritos(idProvincia),
//     enabled: !!idProvincia,
//     gcTime: Infinity,
//   });
// };
