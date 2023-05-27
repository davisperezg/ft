import {
  getResourcesXRol,
  getResourcesXUser,
  postResoucesXRol,
  postResoucesXUser,
} from "./../api/resources";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPermisosToUsers } from "../api/user";
import { IError } from "../interface/error.interface";
import { getModulesXUser, postServicesXUser } from "../api/modulos-system";
import { ServicesInput } from "../interface/modules-input.interface";
import { ResourcesInput } from "../interface/resources-input.interface";
import { IServer } from "../interface/server.interface";

const KEY_USERS = "resources_availables";
const KEY_BY_USERS = "resources_x_user";
const KEY_BY_ROLES = "resources_x_roles";
const KEY_SERVICES_BY_USERS = "services_x_user";

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
