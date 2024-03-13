import { useQuery } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { ITipoIgv } from "../interface/tipo_igv.interface";
import { getTipoIgvs } from "../api/tipo_igv";

const KEY = "tipos_igv";

export const useTipoIgv = () => {
  return useQuery<ITipoIgv[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getTipoIgvs(),
  });
};
