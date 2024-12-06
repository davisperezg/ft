import axios from "axios";
import { IServer } from "../../../interfaces/common/server.interface";
import { IUser } from "../../../interfaces/models/user/user.interface";
import { IRol } from "../../../interfaces/models/rol/rol.interface";
import { BASE_API } from "../../../config/constants";

export const getUsers = async () => {
  const { data } = await axios.get<IUser[]>(`${BASE_API}/api/v1/users`);
  return data;
};

export const getRolesToUsers = async () => {
  const { data } = await axios.get<IRol[]>(`${BASE_API}/api/v1/roles/to-users`);
  return data;
};

export const getModulesToUsers = async () => {
  const { data } = await axios.get<any[]>(`${BASE_API}/api/v1/modules/to-dual`);
  return data;
};

export const getPermisosToUsers = async () => {
  const { data } = await axios.get<any[]>(
    `${BASE_API}/api/v1/resources/to-dual`
  );
  return data;
};

export const postUser = async (body: IUser) => {
  const { data } = await axios.post<IServer<IUser>>(
    `${BASE_API}/api/v1/users`,
    body
  );

  return data;
};

export const editUser = async (body: IUser, id: string) => {
  const { data } = await axios.put<IServer<IUser>>(
    `${BASE_API}/api/v1/users/${id}`,
    body
  );

  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await axios.delete(`${BASE_API}/api/v1/users/${id}`);
  return data;
};

export const restoreUser = async (id: string) => {
  const { data } = await axios.patch(`${BASE_API}/api/v1/users/${id}`);
  return data;
};

export const updatePassword = async (
  body: { password: string },
  id: string
) => {
  const { data } = await axios.patch(
    `${BASE_API}/api/v1/users/change-password/${id}`,
    body
  );

  return data;
};
