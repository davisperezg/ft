import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IInvoice } from "../interface/invoice.interface";
import { IServer } from "../interface/server.interface";
import { IError } from "../interface/error.interface";
import { postInvoice } from "../api/invoice";

const KEY = "invoices";

export const usePostInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IInvoice>, IError, IInvoice>({
    mutationFn: (invoice) => postInvoice(invoice),
    onSuccess: ({ response }) => {
      //Al registrar rol agregamos a la lista cacheada del crud list roles
      queryClient.setQueryData([KEY], (prevInvoices: IInvoice[] | undefined) =>
        prevInvoices ? [...prevInvoices, response] : [response]
      );

      queryClient.invalidateQueries([KEY]);
    },
  });
};
