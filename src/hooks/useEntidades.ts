import { useQuery } from "@tanstack/react-query";
import {
  IDepartamento,
  IDistrito,
  IProvincia,
} from "../interface/entidades.interface";
import { IError } from "../interface/error.interface";
import {
  getDepartamentos,
  getDistritos,
  getProvincias,
} from "../api/entidades";

const KEY_DEPARTAMENTOS = "departamentos";
const KEY_PROVINCIAS = "provincias";
const KEY_DISTRITOS = "distritos";

export const useDepartamentos = () => {
  return useQuery<IDepartamento[], IError>({
    queryKey: [KEY_DEPARTAMENTOS],
    queryFn: async () => await getDepartamentos(),
  });
};

export const useProvincias = (idDepartamento = "") => {
  return useQuery<IProvincia[], IError>({
    queryKey: [KEY_PROVINCIAS, idDepartamento],
    queryFn: () => getProvincias(idDepartamento),
    enabled: !!idDepartamento,
  });
};

export const useDistritos = (idProvincia = "") => {
  return useQuery<IDistrito[], IError>({
    queryKey: [KEY_DISTRITOS, idProvincia],
    queryFn: () => getDistritos(idProvincia),
    enabled: !!idProvincia,
  });
};

export const useProvinciasDinamic = (
  idDinamica: string,
  idDepartamento = ""
) => {
  return useQuery<IProvincia[], IError>({
    queryKey: [`${KEY_PROVINCIAS}_${idDinamica}`, idDepartamento],
    queryFn: () => getProvincias(idDepartamento),
    enabled: !!idDepartamento,
    cacheTime: Infinity,
  });
};

export const useDistritosDinamic = (idDinamica: string, idProvincia = "") => {
  return useQuery<IDistrito[], IError>({
    queryKey: [`${KEY_DISTRITOS}_${idDinamica}`, idProvincia],
    queryFn: () => getDistritos(idProvincia),
    enabled: !!idProvincia,
    cacheTime: Infinity,
  });
};
