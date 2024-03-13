import axios from "axios";
import { IInvoice } from "../interface/invoice.interface";
import { IServer } from "../interface/server.interface";
import { BASE_API } from "../utils/const";

export const postInvoice = async (body: IInvoice) => {
  const { data } = await axios.post<IServer<IInvoice>>(
    `${BASE_API}/api/v1/invoices`,
    body
  );

  return data;
};
