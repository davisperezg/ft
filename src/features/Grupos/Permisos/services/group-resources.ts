import axios from "axios";
import { IGroup } from "../../../../interfaces/models/grupos/grupo-permiso.interface";
import { BASE_API } from "../../../../config/constants";

export const getGroups = async () => {
  const { data } = await axios.get<IGroup[]>(
    `${BASE_API}/api/v1/groups-resources`
  );
  return data;
};
