import axios from "axios";
import { ISeries } from "../interface/series.interface";
import { BASE_API } from "../utils/const";
import { IServer } from "../interface/server.interface";

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

export const postMigrateSerie = async (body: ISeries) => {
  const { data } = await axios.post<IServer<ISeries>>(
    `${BASE_API}/api/v1/series/migrate`,
    body
  );

  return data;
};
