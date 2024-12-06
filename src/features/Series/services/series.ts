import axios from "axios";
import { IServer } from "../../../interfaces/common/server.interface";
import {
  ISeries,
  ISeriesMigrate,
} from "../../../interfaces/models/series/series.interface";
import { BASE_API } from "../../../config/constants";

export const getSeries = async () => {
  const { data } = await axios.get<ISeries[]>(`${BASE_API}/api/v1/series`);
  return data;
};

export const getSerie = async (id: number) => {
  const { data } = await axios.get(`${BASE_API}/api/v1/series/empresa/${id}`);
  return data;
};

export const postNewSerie = async (body: ISeries) => {
  const { data } = await axios.post<IServer<ISeries>>(
    `${BASE_API}/api/v1/series`,
    body
  );

  return data;
};

export const postMigrateSerie = async (body: ISeriesMigrate) => {
  const { data } = await axios.post<IServer<ISeriesMigrate>>(
    `${BASE_API}/api/v1/series/migrate`,
    body
  );

  return data;
};

export const disableSerie = async (id: number) => {
  const { data } = await axios.patch(`${BASE_API}/api/v1/series/disable/${id}`);

  return data;
};

export const enableSerie = async (id: number) => {
  const { data } = await axios.patch(`${BASE_API}/api/v1/series/enable/${id}`);
  return data;
};
