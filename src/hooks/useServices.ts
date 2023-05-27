import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPersona } from "../api/ext";
import { IError } from "../interface/error.interface";

const KEY = "ext_person";

export const useReniec = (tipDocumento: string, nroDocumento: string) => {
  const queryClient = useQueryClient();

  return useQuery<any, IError, any>({
    queryKey: [KEY, tipDocumento, nroDocumento],
    queryFn: () => getPersona(tipDocumento, nroDocumento),
    enabled: false,
    cacheTime: 0,
    retry: 0,
  });
};
