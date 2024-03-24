import axios from "axios";
import { IInvoice } from "../interface/invoice.interface";
import { IServer } from "../interface/server.interface";
import { BASE_API } from "../utils/const";

interface IQueryDataPagination {
  statusCode: string;
  total: number;
  currentPage: number;
  nextPage: boolean;
  prevPage: boolean;
  totalPage: number;
  items: IInvoice[];
}

export const postInvoice = async (body: IInvoice) => {
  const { data } = await axios.post<IServer<IInvoice>>(
    `${BASE_API}/api/v1/invoices`,
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
  const { data } = await axios.get<IQueryDataPagination>(
    `${BASE_API}/api/v1/invoices?empresa=${idEmpresa}&establecimiento=${idEstablecimiento}&page=${page}&pageSize=${pageSize}`
  );

  return data;
};
