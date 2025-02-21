import axios from "axios";
import { IServer } from "../../../interfaces/common/server.interface";
import { BASE_API } from "../../../config/constants";
import { ITipoDoc } from "../../../interfaces/features/tipo-docs-cpe/tipo-docs.interface";
import { IFormCPEType } from "../../../interfaces/forms/type-doc-cpe/type-doc-cpe.interface";

export const getAllTipoDocs = async () => {
  const { data } = await axios.get<ITipoDoc[]>(`${BASE_API}/api/v1/tipodocs`);
  return data;
};

export const disableTipoDocs = async (id: number) => {
  const { data } = await axios.patch(
    `${BASE_API}/api/v1/tipodocs/disable/${id}`
  );
  return data;
};

export const enableTipoDocs = async (id: number) => {
  const { data } = await axios.patch(
    `${BASE_API}/api/v1/tipodocs/enable/${id}`
  );
  return data;
};

export const disableDocumento = async (id: number) => {
  const { data } = await axios.patch(
    `${BASE_API}/api/v1/tipodocs-empresa/disable/${id}`
  );

  return data;
};

export const enableDocumento = async (id: number) => {
  const { data } = await axios.patch(
    `${BASE_API}/api/v1/tipodocs-empresa/enable/${id}`
  );
  return data;
};

export const postTipoDocs = async (body: IFormCPEType) => {
  const { data } = await axios.post<IServer<ITipoDoc>>(
    `${BASE_API}/api/v1/tipodocs`,
    body
  );

  return data;
};

export const editTipoDocs = async (body: ITipoDoc, id: number) => {
  const { data } = await axios.put<IServer<ITipoDoc>>(
    `${BASE_API}/api/v1/tipodocs/${id}`,
    body
  );

  return data;
};
