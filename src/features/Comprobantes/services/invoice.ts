import axios from "axios";
import { IServer } from "../../../interfaces/common/server.interface";
import { BASE_API } from "../../../config/constants";
import { IInvoice } from "../../../interfaces/models/invoices/invoice.interface";
import { IPagination } from "../../../components/common/Table/types";

interface IQueryDataPagination {
  statusCode: string;
  pageCount: number;
  rowCount: number;
  nextPage?: boolean;
  prevPage?: boolean;
  items: IInvoice[];
}

interface IQQueryComunicarBaja {
  idInvoice: number;
  motivo: string;
}

export const postInvoice = async (body: IInvoice) => {
  const { data } = await axios.post<IServer<IInvoice>>(
    `${BASE_API}/api/v1/invoices`,
    body
  );

  return data;
};

export const comunicarBajaInvoice = async (body: IQQueryComunicarBaja) => {
  const { data } = await axios.post<IServer<IQQueryComunicarBaja>>(
    `${BASE_API}/api/v1/invoices/comunicar-baja`,
    body
  );

  return data;
};

export const listInvoices = async (
  idEmpresa: number,
  idEstablecimiento: number,
  page: number,
  pageSize: number
) => {
  const { data } = await axios.get<IPagination<IInvoice>>(
    `${BASE_API}/api/v1/invoices?empresa=${idEmpresa}&establecimiento=${idEstablecimiento}&page=${page}&limit=${pageSize}`
  );

  return data;
};
