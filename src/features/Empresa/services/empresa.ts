import axios from "axios";
import { IServer } from "../../../interfaces/common/server.interface";
import { IUserEmpresa } from "../../../interfaces/features/empresa/users_empresa.interface.";
import { BASE_API } from "../../../config/constants";
import { IEstablecimiento } from "../../../interfaces/models/establecimiento/establecimiento.interface";
import { ITipoDoc } from "../../../interfaces/features/tipo-docs-cpe/tipo-docs.interface";
import { IDTOEmpresa } from "../../../interfaces/models/empresa/empresa.interface";
import { IFeatureEmpresaAsign } from "../../../interfaces/features/empresa/empresa.interface";
import {
  IFormEmpresaCreate,
  IFormEmpresaUpdate,
} from "../../../interfaces/forms/empresa/empresa.interface";
import { IPos } from "../../../interfaces/models/pos/pos.interface";

export const getEmpresas = async () => {
  const { data } = await axios.get<IDTOEmpresa[]>(
    `${BASE_API}/api/v1/empresas`
  );
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

export const getPosByEstablishmentId = async (establishmentId: number) => {
  const { data } = await axios.get<IPos[]>(
    `${BASE_API}/api/v1/empresas/establecimientos/${establishmentId}/pos`
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
  const { data } = await axios.get<IFeatureEmpresaAsign[]>(
    `${BASE_API}/api/v1/users/list-empresas/${id}`
  );
  return data;
};

export const disableEmpresa = async (id: number) => {
  const { data } = await axios.patch(
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

export const postNewEmpresa = async (body: IFormEmpresaCreate) => {
  const { data } = await axios.post<IServer<IDTOEmpresa>>(
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

export const putEmpresa = async (id: number, body: IFormEmpresaUpdate) => {
  const { data } = await axios.put<IServer<IDTOEmpresa>>(
    `${BASE_API}/api/v1/empresas/${id}`,
    body
  );

  return data;
};
