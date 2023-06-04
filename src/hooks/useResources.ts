import {
  activateResources,
  desactivateResources,
  editResources,
  getResources,
  getResourcesXRol,
  getResourcesXUser,
  postResoucesXRol,
  postResoucesXUser,
  postResources,
} from "./../api/resources";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPermisosToUsers } from "../api/user";
import { IError } from "../interface/error.interface";
import { getModulesXUser, postServicesXUser } from "../api/modulos-system";
import { ServicesInput } from "../interface/modules-input.interface";
import { ResourcesInput } from "../interface/resources-input.interface";
import { IServer } from "../interface/server.interface";
import { IPermisos } from "../interface/permisos..interface";

const KEY = "resources";
const KEY_USERS = "resources_availables";
const KEY_BY_USERS = "resources_x_user";
const KEY_BY_ROLES = "resources_x_roles";
const KEY_SERVICES_BY_USERS = "services_x_user";

export const useResources = () => {
  return useQuery<IPermisos[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getResources(),
  });
};

export const usePostResources = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IPermisos>, IError, IPermisos>({
    mutationFn: (permiso) => postResources(permiso),
    onSuccess: ({ response }) => {
      queryClient.setQueryData(
        [KEY],
        (prevPermiso: IPermisos[] | undefined) => {
          return prevPermiso ? [...prevPermiso, response] : [response];
        }
      );

      queryClient.invalidateQueries([KEY]);
    },
  });
};

export const useEditResource = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IServer<IPermisos>,
    IError,
    { body: IPermisos; id: string }
  >({
    mutationFn: ({ body, id }) => editResources(body, id),
    onSuccess: ({ response }) => {
      queryClient.setQueryData(
        [KEY],
        (prevPermiso: IPermisos[] | undefined) => {
          if (prevPermiso) {
            const updatedPermiso = prevPermiso.map((permiso) => {
              if (permiso._id === response._id)
                return { ...permiso, ...response };
              return permiso;
            });

            return updatedPermiso;
          }

          return prevPermiso;
        }
      );

      queryClient.invalidateQueries([KEY]);
    },
  });
};

export const useDesactivateResources = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => desactivateResources(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData([KEY], (prevReso: IPermisos[] | undefined) =>
          prevReso
            ? prevReso.map((res) => ({
                ...res,
                status: res._id === id ? false : res.status,
              }))
            : prevReso
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

export const useActivateResources = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => activateResources(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData([KEY], (prevReso: IPermisos[] | undefined) => {
          return prevReso
            ? prevReso.map((res) => ({
                ...res,
                status: res._id === id ? true : res.status,
              }))
            : prevReso;
        });

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

export const usePostResourcesXRol = () => {
  return useMutation<IServer<any>, IError, ResourcesInput>({
    mutationFn: (resources) => postResoucesXRol(resources),
  });
};

export const usePostResourcesXuser = () => {
  return useMutation<any, IError, ResourcesInput>({
    mutationFn: (resources) => postResoucesXUser(resources),
  });
};

export const usePostServicesXuser = () => {
  return useMutation<IServer<any>, IError, ServicesInput>({
    mutationFn: (modules) => postServicesXUser(modules),
  });
};

export const usePermisosAvailables = () => {
  return useQuery<any[], IError>({
    queryKey: [KEY_USERS],
    queryFn: () => getPermisosToUsers(),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useServicesXuser = (id: string) => {
  return useQuery<any, IError, any>({
    queryKey: [KEY_SERVICES_BY_USERS, id],
    queryFn: () => getModulesXUser(id),
    cacheTime: 0,
  });
};

export const usePermisosXuser = (id: string) => {
  return useQuery<any, IError, any>({
    queryKey: [KEY_BY_USERS, id],
    queryFn: () => getResourcesXUser(id),
    cacheTime: 0,
  });
};

export const usePermisosXrole = (id: string) => {
  return useQuery<any, IError, any>({
    queryKey: [KEY_BY_ROLES, id],
    queryFn: () => getResourcesXRol(id),
    cacheTime: 0,
  });
};
