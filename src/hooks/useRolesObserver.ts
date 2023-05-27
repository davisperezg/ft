import { QueryObserver, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IRol } from "../interface/rol.interface";
import { IUser } from "../interface/user.interface";
import { useRolesAvailables } from "./useRoles";
import { useUsers } from "./useUsers";

export const useUsersObserver = () => {
  const get_users = useRolesAvailables();

  const queryClient = useQueryClient();

  const [roles, setRoles] = useState<IRol[]>(() => {
    const data = queryClient.getQueryData<IRol[]>(["roles_availables"]);
    return data ?? [];
  });

  useEffect(() => {
    const observer = new QueryObserver<IRol[]>(queryClient, {
      queryKey: ["roles_availables"],
    });

    const unsubscribe = observer.subscribe((result) => {
      console.log(result);
      if (result.data) setRoles(result.data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...get_users,
    data: roles,
  };
};
