import { useQuery } from "@tanstack/react-query";
import { IError } from "../../../interfaces/common/error.interface";
import { getTipoIgvs } from "../services/tipo_igv";
import { ITipoIgv } from "../../../interfaces/models/tipo-igv/tipo_igv.interface";

const KEY = "tipos_igv";

export const useTipoIgv = () => {
  return useQuery<ITipoIgv[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getTipoIgvs(),
  });
};
