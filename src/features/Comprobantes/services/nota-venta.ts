import axios from "axios";
import { BASE_API } from "../../../config/constants";
import { IPagination } from "../../../components/common/Table/types";
import type { NotaVenta, NotaVentaListItem } from "../types/nota-venta.types";

export const postNotaVenta = async (body: NotaVenta) => {
  const { data } = await axios.post<NotaVenta>(`${BASE_API}/api/v1/nota-ventas`, body);
  return data;
};

export const listNotaVentas = async (
  idEmpresa: number,
  idEstablecimiento: number,
  page: number,
  pageSize: number
) => {
  const { data } = await axios.get<IPagination<NotaVentaListItem>>(
    `${BASE_API}/api/v1/nota-ventas?empresa=${idEmpresa}&establecimiento=${idEstablecimiento}&page=${page}&limit=${pageSize}`
  );
  return data;
};

export const anularNotaVenta = async (id: number) => {
  const { data } = await axios.delete(`${BASE_API}/api/v1/nota-venta/${id}`);
  return data;
};
