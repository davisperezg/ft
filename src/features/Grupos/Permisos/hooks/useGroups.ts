import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../services/group-resources";
import { IError } from "../../../../interfaces/common/error.interface";
import { IGroup } from "../../../../interfaces/models/grupos/grupo-permiso.interface";

const KEY = "groups-resources";

export const useGroups = () => {
  return useQuery<IGroup[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getGroups(),
  });
};
