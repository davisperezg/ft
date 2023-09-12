import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { IServer } from "../interface/server.interface";
import { IEmpresa } from "../interface/empresa.interface";
import { postNewEmpresa } from "../api/empresa";

const KEY = "empresas";

export const usePostEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IEmpresa>, IError, any>({
    mutationFn: (empresa) => postNewEmpresa(empresa),
    onSuccess: ({ response }) => {
      queryClient.setQueryData(
        [KEY],
        (prevEmpresas: IEmpresa[] | undefined) => {
          return prevEmpresas ? [...prevEmpresas, response] : [response];
        }
      );

      queryClient.invalidateQueries([KEY]);
    },
  });
};
