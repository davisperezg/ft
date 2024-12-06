import { useQuery } from "@tanstack/react-query";
import { IError } from "../../../interfaces/common/error.interface";
import { getMonedas } from "../services/moneda";
import { IMoneda } from "../../../interfaces/models/tipo-moneda/moneda.interface";

const KEY = "monedas";

export const useMonedas = () => {
  return useQuery<IMoneda[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getMonedas(),
  });
};
