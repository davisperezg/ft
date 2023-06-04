import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../api/group-resources";
import { IError } from "../interface/error.interface";
import { IGroup } from "../interface/group.interface";

const KEY = "groups-resources";

export const useGroups = () => {
  return useQuery<IGroup[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getGroups(),
  });
};
