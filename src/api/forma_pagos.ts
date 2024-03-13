import axios from "axios";
import { BASE_API } from "../utils/const";
import { IFormaPagos } from "../interface/forma_pagos.interface";

export const getFormaPagos = async () => {
  const { data } = await axios.get<IFormaPagos[]>(
    `${BASE_API}/api/v1/forma-pagos`
  );
  return data;
};
