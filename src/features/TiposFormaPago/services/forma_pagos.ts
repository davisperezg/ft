import axios from "axios";
import { IFormaPagos } from "../../../interfaces/models/forma-pagos/forma_pagos.interface";
import { BASE_API } from "../../../config/constants";

export const getFormaPagos = async () => {
  const { data } = await axios.get<IFormaPagos[]>(
    `${BASE_API}/api/v1/forma-pagos`
  );
  return data;
};
