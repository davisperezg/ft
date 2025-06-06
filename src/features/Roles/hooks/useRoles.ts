import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRol,
  editRol,
  getRoles,
  postRol,
  restoreRol,
} from "../services/rol";
import { getRolesToUsers } from "../../Users/services/user";
import { IError } from "../../../interfaces/common/error.interface";
import { IServer } from "../../../interfaces/common/server.interface";
import { IRol } from "../../../interfaces/models/rol/rol.interface";

const KEY = "roles";
const KEY_USERS = "roles_availables";

export const useRoles = () => {
  return useQuery<IRol[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getRoles(),
  });
};

export const useRolesAvailables = () => {
  return useQuery<IRol[], IError>({
    queryKey: [KEY_USERS],
    queryFn: () => getRolesToUsers(),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const usePostRol = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IRol>, IError, IRol>({
    mutationFn: (rol) => postRol(rol),
    onSuccess: ({ response }) => {
      //Al registrar rol agregamos a la lista cacheada del crud list roles
      queryClient.setQueryData([KEY], (prevRoles: IRol[] | undefined) =>
        prevRoles ? [...prevRoles, response] : [response]
      );

      queryClient.invalidateQueries({
        queryKey: [KEY],
      });
    },
  });
};

export const useEditRol = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IRol>, IError, { body: IRol; id: string }>({
    mutationFn: ({ body, id }) => editRol(body, id),
    onSuccess: ({ response }) => {
      queryClient.setQueryData([KEY], (prevRoles: IRol[] | undefined) => {
        if (prevRoles) {
          const updatedRoles = prevRoles.map((rol) => {
            if (rol._id === response._id) return { ...rol, ...response };
            return rol;
          });

          return updatedRoles;
        }

        return prevRoles;
      });

      queryClient.invalidateQueries({
        queryKey: [KEY],
      });
    },
  });
};

export const useDeleteRol = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => deleteRol(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData([KEY], (prevRoles: IRol[] | undefined) =>
          prevRoles
            ? prevRoles.map((rol) => ({
                ...rol,
                status: rol._id === id ? false : rol.status,
              }))
            : prevRoles
        );

        queryClient.invalidateQueries({
          queryKey: [KEY],
        });
      }
    },
  });
};

export const useRestoreRol = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => restoreRol(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData([KEY], (prevRoles: IRol[] | undefined) => {
          return prevRoles
            ? prevRoles.map((rol) => ({
                ...rol,
                status: rol._id === id ? true : rol.status,
              }))
            : prevRoles;
        });

        queryClient.invalidateQueries({
          queryKey: [KEY],
        });
      }
    },
  });
};
