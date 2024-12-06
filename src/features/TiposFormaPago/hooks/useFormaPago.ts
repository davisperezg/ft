import { useQuery } from "@tanstack/react-query";
import { IError } from "../../../interfaces/common/error.interface";
import { getFormaPagos } from "../services/forma_pagos";
import { IFormaPagos } from "../../../interfaces/models/forma-pagos/forma_pagos.interface";

const KEY = "forma_pago";

export const useFormaPago = () => {
  return useQuery<IFormaPagos[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getFormaPagos(),
  });
};
