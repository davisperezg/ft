import { useQuery } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { ITipoEntidades } from "../interface/tipo_entidades.interface";
import { getTipoEntidades } from "../api/tipo_entidades";

const KEY = "tipos_entidades";

export const useTipoEntidades = () => {
  return useQuery<ITipoEntidades[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getTipoEntidades(),
  });
};
