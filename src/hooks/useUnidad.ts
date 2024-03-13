import { useQuery } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { IUnidades } from "../interface/unidades.interface";
import { getUnidades } from "../api/unidad";

const KEY = "unidades";

export const useUnidad = () => {
  return useQuery<IUnidades[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getUnidades(),
  });
};
