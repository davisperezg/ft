import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { anularNotaVenta, listNotaVentas } from "../services/nota-venta";
import { toast } from "sonner";
import { IError } from "../../../interfaces/common/error.interface";

const KEY = "nota-ventas";

export const useNotaVentas = (empresa: number, establecimiento: number, pageIndex: number, pageSize: number) => {
  return useQuery({
    queryKey: [KEY, empresa, establecimiento, pageIndex, pageSize],
    queryFn: () => listNotaVentas(empresa, establecimiento, pageIndex, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAnularNotaVenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anularNotaVenta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Nota de venta anulada correctamente");
    },
    onError: (e: IError) => {
      toast.error(e?.response?.data?.message || "Error al anular la nota de venta");
    },
  });
};
