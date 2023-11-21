import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { IServer } from "../interface/server.interface";
import { IEmpresa } from "../interface/empresa.interface";
import {
  disableEmpresa,
  enableEmpresa,
  getDocumentosByEmpresa,
  getEmpresa,
  getEmpresas,
  getEstablecimientosByEmpresa,
  getUsersEmpresas,
  postNewEmpresa,
  putEmpresa,
} from "../api/empresa";
import { IUserEmpresa } from "../interface/users_empresa.interface.";
import { IEstablecimiento } from "../interface/establecimiento.interface";
import { ITipoDoc } from "../interface/tipodocs.interface";

const KEY = "empresas";
const KEY_GET_EMPRESA = "get_empresa";
const KEY_USERS_EMPRESA = "users_empresas";
const KEY_ESTABLECIMIENTO = "get_empresa_establecimientos";
const KEY_DOCUMENTO = "get_empresa_documentos";

export const useEmpresas = () => {
  return useQuery<IEmpresa[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getEmpresas(),
  });
};

export const useEmpresa = (id: number) => {
  return useQuery<IEmpresa, IError>({
    queryKey: [KEY_GET_EMPRESA, id],
    queryFn: async () => await getEmpresa(id),
    enabled: !!id,
  });
};

export const useEstablecimientosByEmpresa = (id: number) => {
  return useQuery<IEstablecimiento[], IError>({
    queryKey: [KEY_ESTABLECIMIENTO, id],
    queryFn: async () => await getEstablecimientosByEmpresa(id),
    enabled: !!id,
  });
};

export const useDocumentosByEmpresa = (id: number) => {
  return useQuery<ITipoDoc[], IError>({
    queryKey: [KEY_DOCUMENTO, id],
    queryFn: async () => await getDocumentosByEmpresa(id),
    enabled: !!id,
  });
};

export const useUsersEmpresa = () => {
  return useQuery<IUserEmpresa[], IError>({
    queryKey: [KEY_USERS_EMPRESA],
    queryFn: async () => await getUsersEmpresas(),
  });
};

export const useDisableEmpresas = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => disableEmpresa(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData(
          [KEY],
          (prevEmpresas: IEmpresa[] | undefined) =>
            prevEmpresas
              ? prevEmpresas.map((emp) => ({
                  ...emp,
                  estado: emp.id === id ? false : emp.estado,
                }))
              : prevEmpresas
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

export const useEnableEmpresas = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => enableEmpresa(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData(
          [KEY],
          (prevEmpresas: IEmpresa[] | undefined) => {
            return prevEmpresas
              ? prevEmpresas.map((emp) => ({
                  ...emp,
                  estado: emp.id === id ? true : emp.estado,
                }))
              : prevEmpresas;
          }
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

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

export const useEditEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IEmpresa>, IError, { body: IEmpresa; id: number }>(
    {
      mutationFn: ({ body, id }) => putEmpresa(id, body),
      onSuccess: async ({ response }) => {
        queryClient.setQueryData([KEY], (prevEmpresa: any[] | undefined) => {
          if (prevEmpresa) {
            const updatedEmpresa = prevEmpresa.map((emp) => {
              if (emp.id === response.id) return { ...emp, ...response };
              return emp;
            });
            return updatedEmpresa;
          }
          return prevEmpresa;
        });

        await queryClient.invalidateQueries({
          queryKey: ["series"],
          exact: true,
          refetchType: "inactive",
        });
        await queryClient.invalidateQueries([KEY]);
        await queryClient.invalidateQueries([KEY_GET_EMPRESA, response?.id]);
      },
    }
  );
};
