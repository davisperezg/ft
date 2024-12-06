import axios from "axios";
import { ServicesInput } from "../../../interfaces/forms/modulo/modules-input.interface";
import { IModulosSystem } from "../../../interfaces/features/modulo/modulo_system.interface";
import { IServer } from "../../../interfaces/common/server.interface";
import { BASE_API } from "../../../config/constants";

//Edit o crea los servicios o modulos x usuario
export const postServicesXUser = async (body: ServicesInput) => {
  const { data } = await axios.post(`${BASE_API}/api/v1/services-users`, body);

  return data;
};

//Lista los modulos o servicios x usuario
export const getModulesXUser = async (id: string) => {
  const { data } = await axios.get<any[]>(
    `${BASE_API}/api/v1/services-users/user/${id}`
  );
  return data;
};

export const getModuloS = async () => {
  const { data } = await axios.get<IModulosSystem[]>(
    `${BASE_API}/api/v1/modules`
  );
  return data;
};

export const postModulo = async (body: IModulosSystem) => {
  const { data } = await axios.post<IServer<IModulosSystem>>(
    `${BASE_API}/api/v1/modules`,
    body
  );

  return data;
};

export const editModulo = async (body: IModulosSystem, id: string) => {
  const { data } = await axios.put<IServer<IModulosSystem>>(
    `${BASE_API}/api/v1/modules/${id}`,
    body
  );

  return data;
};

export const deleteModulo = async (id: string) => {
  const { data } = await axios.delete(`${BASE_API}/api/v1/modules/${id}`);
  return data;
};

export const restoreModulo = async (id: string) => {
  const { data } = await axios.patch(`${BASE_API}/api/v1/modules/${id}`);
  return data;
};
