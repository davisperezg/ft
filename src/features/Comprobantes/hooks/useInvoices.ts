import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listInvoices } from "../services/invoice";

const KEY = "invoices";

export const useInvoices = (
  empresa: number,
  establecimiento: number,
  pageIndex: number,
  pageSize: number
) => {
  return useQuery({
    queryKey: [KEY, empresa, establecimiento, pageIndex, pageSize],
    queryFn: () => listInvoices(empresa, establecimiento, pageIndex, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
};
