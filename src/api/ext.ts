import axios from "axios";
import { BASE_API } from "../utils/const";

export const getPersona = async (tipDocument: string, nroDocument: string) => {
  const { data } = await axios.get(
    `${BASE_API}/api/v1/auth/ext/${tipDocument}/${nroDocument}`
  );

  return data;
};

export const getRucSunat = async (nroRuc: string) => {
  const { data } = await axios.get(
    `${BASE_API}/api/v1/auth/ext/sunat/ruc/${nroRuc}`
  );

  return data;
};

export const getDniSunat = async (nroDni: string) => {
  const { data } = await axios.get(
    `${BASE_API}/api/v1/auth/ext/sunat/dni/${nroDni}`
  );

  return data;
};
