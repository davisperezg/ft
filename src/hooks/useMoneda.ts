import { useQuery } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { IMoneda } from "../interface/moneda.interface";
import { getMonedas } from "../api/moneda";

const KEY = "monedas";

export const useMonedas = () => {
  return useQuery<IMoneda[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getMonedas(),
  });
};
