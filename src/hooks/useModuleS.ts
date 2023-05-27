import { IModulosSystem } from "./../interface/modulo_system.interface";
import {
  deleteModulo,
  editModulo,
  getModuloS,
  postModulo,
  restoreModulo,
} from "../api/modulos-system";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { getModulesToUsers } from "../api/user";

const KEY = "modules_system";
const KEY_USERS = "modules_availables";

export const useModules = () => {
  return useQuery<IModulosSystem[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getModuloS(),
  });
};

export const useModulesAvailables = () => {
  return useQuery<any[], IError>({
    queryKey: [KEY_USERS],
    queryFn: () => getModulesToUsers(),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const usePostModule = () => {
  const queryClient = useQueryClient();

  return useMutation<any, IError, { module: IModulosSystem }, any>({
    mutationFn: ({ module }) => postModulo(module),
    onSuccess: (modulo: IModulosSystem) => {
      queryClient.setQueryData(
        [KEY],
        (prevModulos: IModulosSystem[] | undefined) =>
          prevModulos ? [...prevModulos, modulo] : [modulo]
      );

      queryClient.invalidateQueries([KEY]);
    },
  });
};

export const useEditModule = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IModulosSystem,
    IError,
    { body: IModulosSystem; id: string }
  >({
    mutationFn: ({ body, id }) => editModulo(body, id),
    onSuccess: (mod_updated: IModulosSystem) => {
      queryClient.setQueryData(
        [KEY],
        (prevModulos: IModulosSystem[] | undefined) => {
          if (prevModulos) {
            const updatedUsers = prevModulos.map((modulo) => {
              if (modulo._id === mod_updated._id)
                return { ...modulo, ...mod_updated };
              return modulo;
            });

            return updatedUsers;
          }

          return prevModulos;
        }
      );

      queryClient.invalidateQueries([KEY]);
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => deleteModulo(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData(
          [KEY],
          (prevModulos: IModulosSystem[] | undefined) =>
            prevModulos
              ? prevModulos.map((modulo) => ({
                  ...modulo,
                  status: modulo._id === id ? false : modulo.status,
                }))
              : prevModulos
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

export const useRestoreModule = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => restoreModulo(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData(
          [KEY],
          (prevModulos: IModulosSystem[] | undefined) => {
            return prevModulos
              ? prevModulos.map((modulo) => ({
                  ...modulo,
                  status: modulo._id === id ? true : modulo.status,
                }))
              : prevModulos;
          }
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};
