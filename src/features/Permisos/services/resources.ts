import axios from "axios";
import { ResourcesInput } from "../../../interfaces/forms/permisos/resources-input.interface";
import { IServer } from "../../../interfaces/common/server.interface";
import { BASE_API } from "../../../config/constants";
import { IPermisos } from "../../../interfaces/models/permisos/permisos.interface";

//Se usara para consultar los permisos disponibles que tiene el usuario
export const getAccess = async (id: string) => {
  const { data } = await axios.get<any[]>(
    `${BASE_API}/api/v1/resources-users/view/${id}`
  );
  return data;
};

export const getResources = async () => {
  const { data } = await axios.get<IPermisos[]>(
    `${BASE_API}/api/v1/resources/list`
  );
  return data;
};

export const postResources = async (body: IPermisos) => {
  const { data } = await axios.post<IServer<IPermisos>>(
    `${BASE_API}/api/v1/resources`,
    body
  );

  return data;
};

export const editResources = async (body: IPermisos, id: string) => {
  const { data } = await axios.put<IServer<IPermisos>>(
    `${BASE_API}/api/v1/resources/${id}`,
    body
  );

  return data;
};

export const desactivateResources = async (id: string) => {
  const { data } = await axios.delete(`${BASE_API}/api/v1/resources/${id}`);
  return data;
};

export const activateResources = async (id: string) => {
  const { data } = await axios.patch(`${BASE_API}/api/v1/resources/${id}`);
  return data;
};

export const getResourcesXRol = async (id: string) => {
  const { data } = await axios.get<any[]>(
    `${BASE_API}/api/v1/resources-roles/role/${id}`
  );
  return data;
};

export const getResourcesXUser = async (id: string) => {
  const { data } = await axios.get<any[]>(
    `${BASE_API}/api/v1/resources-users/user/${id}`
  );
  return data;
};

export const postResoucesXUser = async (body: ResourcesInput) => {
  const { data } = await axios.post(`${BASE_API}/api/v1/resources-users`, body);

  return data;
};

export const postResoucesXRol = async (body: ResourcesInput) => {
  const { data } = await axios.post(`${BASE_API}/api/v1/resources-roles`, body);

  return data;
};
