import { useQuery } from "@tanstack/react-query";
import { IError } from "../../../interfaces/common/error.interface";
import { getUnidades } from "../services/unidad";
import { IUnidades } from "../../../interfaces/models/unidades-medida/unidades.interface";

const KEY = "unidades";

export const useUnidad = () => {
  return useQuery<IUnidades[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getUnidades(),
  });
};
