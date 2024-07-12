import { useQuery } from "@tanstack/react-query";
import { getPersona } from "../api/ext";
import { IError } from "../interface/error.interface";

const KEY = "ext_person";
const KEY_EMPRESA = "ext_empresa";

export const useSunat = (tipDocumento: string, nroDocumento: string) => {
  return useQuery<any, IError, any>({
    queryKey: [KEY_EMPRESA, tipDocumento, nroDocumento],
    queryFn: () => getPersona(tipDocumento, nroDocumento),
    enabled: false,
    gcTime: 0,
    retry: 0,
  });
};

export const useReniec = (tipDocumento: string, nroDocumento: string) => {
  return useQuery<any, IError, any>({
    queryKey: [KEY, tipDocumento, nroDocumento],
    queryFn: () => getPersona(tipDocumento, nroDocumento),
    enabled: false,
    gcTime: 0,
    retry: 0,
  });
};
