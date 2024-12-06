import axios from "axios";
import { IModulosSystem } from "../../../interfaces/features/modulo/modulo_system.interface";
import { IServer } from "../../../interfaces/common/server.interface";
import { IRol } from "../../../interfaces/models/rol/rol.interface";
import { BASE_API } from "../../../config/constants";

export const getRoles = async () => {
  const { data } = await axios.get<IRol[]>(`${BASE_API}/api/v1/roles`);
  return data;
};

export const postRol = async (body: IModulosSystem) => {
  const { data } = await axios.post<IServer<IRol>>(
    `${BASE_API}/api/v1/roles`,
    body
  );

  return data;
};

export const editRol = async (body: IRol, id: string) => {
  const { data } = await axios.put<IServer<IRol>>(
    `${BASE_API}/api/v1/roles/${id}`,
    body
  );

  return data;
};

export const deleteRol = async (id: string) => {
  const { data } = await axios.delete(`${BASE_API}/api/v1/roles/${id}`);
  return data;
};

export const restoreRol = async (id: string) => {
  const { data } = await axios.patch(`${BASE_API}/api/v1/roles/${id}`);
  return data;
};
