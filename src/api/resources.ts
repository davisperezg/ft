import axios from "axios";
import { IPermisos } from "../interface/permisos..interface";
import { ResourcesInput } from "../interface/resources-input.interface";
import { IServer } from "../interface/server.interface";
import { BASE_API } from "../utils/const";

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
