import axios from "axios";
import { IGroup } from "../interface/group.interface";
import { BASE_API } from "../utils/const";

export const getGroups = async () => {
  const { data } = await axios.get<IGroup[]>(
    `${BASE_API}/api/v1/groups-resources`
  );
  return data;
};
