import { useQuery } from "@tanstack/react-query";
import { IError } from "../../../interfaces/common/error.interface";
import { getTipoEntidades } from "../services/tipo_entidades";
import { ITipoEntidades } from "../../../interfaces/models/tipo-docs-identidad/tipo_entidades.interface";

const KEY = "tipos_entidades";

export const useTipoEntidades = () => {
  return useQuery<ITipoEntidades[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getTipoEntidades(),
  });
};
