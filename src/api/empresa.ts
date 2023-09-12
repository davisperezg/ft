import { IEmpresa } from "./../interface/empresa.interface";
import axios from "axios";
import { IServer } from "../interface/server.interface";
import { BASE_API } from "../utils/const";

export const postNewEmpresa = async (body: IEmpresa) => {
  const { data } = await axios.post<IServer<IEmpresa>>(
    `${BASE_API}/api/v1/users/empresa`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};
