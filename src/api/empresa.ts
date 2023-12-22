import { IEmpresa, IEmpresaAsign } from "./../interface/empresa.interface";
import axios from "axios";
import { IServer } from "../interface/server.interface";
import { BASE_API } from "../utils/const";
import { IUserEmpresa } from "../interface/users_empresa.interface.";
import { IEstablecimiento } from "../interface/establecimiento.interface";
import { ITipoDoc } from "../interface/tipodocs.interface";

export const getEmpresas = async () => {
  const { data } = await axios.get<IEmpresa[]>(`${BASE_API}/api/v1/empresas`);
  return data;
};

export const getEmpresa = async (id: number) => {
  const { data } = await axios.get(`${BASE_API}/api/v1/empresas/${id}`);
  return data.response;
};

export const getEstablecimientosByEmpresa = async (id: number) => {
  const { data } = await axios.get<IEstablecimiento[]>(
    `${BASE_API}/api/v1/empresas/${id}/establecimientos`
  );
  return data;
};

export const getDocumentosByEmpresa = async (id: number) => {
  const { data } = await axios.get<ITipoDoc[]>(
    `${BASE_API}/api/v1/empresas/${id}/documentos`
  );
  return data;
};

export const getUsersEmpresas = async () => {
  const { data } = await axios.get<IUserEmpresa[]>(
    `${BASE_API}/api/v1/users/empresa`
  );
  return data;
};

export const getlistToAsignEmpresasByIdPartner = async (id: string) => {
  const { data } = await axios.get<IEmpresaAsign[]>(
    `${BASE_API}/api/v1/users/list-empresas/${id}`
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

export const putEmpresa = async (id: number, body: IEmpresa) => {
  const { data } = await axios.put<IServer<IEmpresa>>(
    `${BASE_API}/api/v1/empresas/${id}`,
    body
  );

  return data;
};
