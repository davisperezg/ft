import axios from "axios";
import { ITipoDoc } from "../interface/tipodocs.interface";
import { BASE_API } from "../utils/const";
import { IServer } from "../interface/server.interface";

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

export const postTipoDocs = async (body: ITipoDoc) => {
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
