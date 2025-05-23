import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IError } from "../../../interfaces/common/error.interface";
import { IServer } from "../../../interfaces/common/server.interface";

import {
  disableEmpresa,
  enableEmpresa,
  getDocumentosByEmpresa,
  getEmpresa,
  getEmpresas,
  getEstablecimientosByEmpresa,
  getPosByEstablishmentId,
  getUsersEmpresas,
  getlistToAsignEmpresasByIdPartner,
  postNewEmpresa,
  putEmpresa,
} from "../services/empresa";
import { IUserEmpresa } from "../../../interfaces/features/empresa/users_empresa.interface.";
import {
  IDTOEmpresa,
  IDTOEmpresaDetail,
} from "../../../interfaces/models/empresa/empresa.interface";
import { IEstablecimiento } from "../../../interfaces/models/establecimiento/establecimiento.interface";
import { ITipoDoc } from "../../../interfaces/features/tipo-docs-cpe/tipo-docs.interface";
import { IFeatureEmpresaAsign } from "../../../interfaces/features/empresa/empresa.interface";
import { IFormEmpresaUpdate } from "../../../interfaces/forms/empresa/empresa.interface";
import { IPos } from "../../../interfaces/models/pos/pos.interface";

const KEY = "empresas";
const KEY_GET_EMPRESA = "get_empresa";
const KEY_USERS_EMPRESA = "users_empresas";
const KEY_ESTABLECIMIENTO = "get_empresa_establecimientos";
const KEY_DOCUMENTO = "get_empresa_documentos";
const KEY_POS = "get_establishment_pos";
const KEY_ASIGN = "get_empresa_asign";

export const useEmpresas = () => {
  return useQuery<IDTOEmpresa[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getEmpresas(),
  });
};

export const useEmpresa = (id: number) => {
  return useQuery<IDTOEmpresaDetail, IError>({
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

export const usePosByEstablishment = (id: number) => {
  return useQuery<IPos[], IError>({
    queryKey: [KEY_POS, id],
    queryFn: async () => await getPosByEstablishmentId(id),
    enabled: !!id,
  });
};

export const useUsersEmpresa = () => {
  return useQuery<IUserEmpresa[], IError>({
    queryKey: [KEY_USERS_EMPRESA],
    queryFn: async () => await getUsersEmpresas(),
  });
};

export const useAsignEmpresasByIdPartner = (id: string) => {
  return useQuery<IFeatureEmpresaAsign[], IError>({
    queryKey: [KEY_ASIGN, id],
    queryFn: async () => await getlistToAsignEmpresasByIdPartner(id),
    enabled: !!id,
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
          (prevEmpresas: IDTOEmpresa[] | undefined) =>
            prevEmpresas
              ? prevEmpresas.map((emp) => ({
                  ...emp,
                  estado: emp.id === id ? false : emp.estado,
                }))
              : prevEmpresas
        );

        queryClient.invalidateQueries({
          queryKey: [KEY],
        });
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
          (prevEmpresas: IDTOEmpresa[] | undefined) => {
            return prevEmpresas
              ? prevEmpresas.map((emp) => ({
                  ...emp,
                  estado: emp.id === id ? true : emp.estado,
                }))
              : prevEmpresas;
          }
        );

        queryClient.invalidateQueries({
          queryKey: [KEY],
        });
      }
    },
  });
};

export const usePostEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IDTOEmpresa>, IError, any>({
    mutationFn: (empresa) => postNewEmpresa(empresa),
    onSuccess: ({ response }) => {
      queryClient.setQueryData(
        [KEY],
        (prevEmpresas: IDTOEmpresa[] | undefined) => {
          return prevEmpresas ? [...prevEmpresas, response] : [response];
        }
      );

      queryClient.invalidateQueries({
        queryKey: [KEY],
      });
    },
  });
};

export const useEditEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IServer<IDTOEmpresa>,
    IError,
    { body: IFormEmpresaUpdate; id: number }
  >({
    mutationFn: ({ body, id }) => putEmpresa(id, body),
    onSuccess: async ({ response }) => {
      queryClient.setQueryData(
        [KEY],
        (prevEmpresa: IDTOEmpresa[] | undefined) => {
          if (prevEmpresa) {
            const updatedEmpresa = prevEmpresa.map((emp) => {
              if (emp.id === response.id) return { ...emp, ...response };
              return emp;
            });
            return updatedEmpresa;
          }
          return prevEmpresa;
        }
      );

      await queryClient.invalidateQueries({
        queryKey: ["series"],
        exact: true,
        refetchType: "inactive",
      });

      await queryClient.invalidateQueries({
        queryKey: [KEY],
      });

      await queryClient.invalidateQueries({
        queryKey: [KEY_GET_EMPRESA, response?.id],
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: [KEY_ESTABLECIMIENTO, response?.id],
        exact: true,
        refetchType: "inactive",
      });
    },
  });
};
