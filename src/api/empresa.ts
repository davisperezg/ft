import { IEmpresa } from "./../interface/empresa.interface";
import axios from "axios";
import { IServer } from "../interface/server.interface";
import { BASE_API } from "../utils/const";
import { IUserEmpresa } from "../interface/users_empresa.interface.";

export const getEmpresas = async () => {
  const { data } = await axios.get<IEmpresa[]>(`${BASE_API}/api/v1/empresas`);
  return data;
};

export const getEmpresa = async (id: number) => {
  const { data } = await axios.get(`${BASE_API}/api/v1/empresas/${id}`);
  return data.response;
};

export const getUsersEmpresas = async () => {
  const { data } = await axios.get<IUserEmpresa[]>(
    `${BASE_API}/api/v1/users/empresa`
  );
  return data;
};

export const disableEmpresa = async (id: number) => {
  const { data } = await axios.delete(
    `${BASE_API}/api/v1/empresas/disable/${id}`
  );
  return data;
};

export const enableEmpresa = async (id: number) => {
  const { data } = await axios.patch(
    `${BASE_API}/api/v1/empresas/enable/${id}`
  );
  return data;
};

export const postNewEmpresa = async (body: IEmpresa) => {
  const { data } = await axios.post<IServer<IEmpresa>>(
    `${BASE_API}/api/v1/empresas`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};
