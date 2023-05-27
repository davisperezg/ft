import axios from "axios";
import { IModulosSystem } from "../interface/modulo_system.interface";
import { IRol } from "../interface/rol.interface";
import { BASE_API } from "../utils/const";

export const getRoles = async () => {
  const { data } = await axios.get<IRol[]>(`${BASE_API}/api/v1/roles`);
  return data;
};

export const postRol = async (body: IModulosSystem) => {
  const { data } = await axios.post<IRol>(`${BASE_API}/api/v1/roles`, body);

  return data;
};

export const editRol = async (body: IRol, id: string) => {
  const { data } = await axios.put<IRol>(
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
