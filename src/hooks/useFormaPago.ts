import { useQuery } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { IFormaPagos } from "../interface/forma_pagos.interface";
import { getFormaPagos } from "../api/forma_pagos";

const KEY = "forma_pago";

export const useFormaPago = () => {
  return useQuery<IFormaPagos[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getFormaPagos(),
  });
};
