import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { IUser } from "../interface/user.interface";
import {
  deleteUser,
  editUser,
  getUsers,
  postUser,
  restoreUser,
  updatePassword,
} from "../api/user";
import { PasswordInput } from "../interface/password-input.interface";
import { IServer } from "../interface/server.interface";

const KEY = "users";

export const useUsers = () => {
  return useQuery<IUser[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getUsers(),
  });
};

export const usePostUser = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IUser>, IError, IUser>({
    mutationFn: (user) => postUser(user),
    onSuccess: ({ response }) => {
      queryClient.setQueryData([KEY], (prevUsers: IUser[] | undefined) => {
        return prevUsers ? [...prevUsers, response] : [response];
      });

      queryClient.invalidateQueries([KEY]);
    },
  });
};

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<IUser>, IError, { body: IUser; id: string }>({
    mutationFn: ({ body, id }) => editUser(body, id),
    onSuccess: ({ response }) => {
      queryClient.setQueryData([KEY], (prevUsers: IUser[] | undefined) => {
        if (prevUsers) {
          const updatedUsers = prevUsers.map((user) => {
            if (user._id === response._id) return { ...user, ...response };
            return user;
          });

          return updatedUsers;
        }

        return prevUsers;
      });

      queryClient.invalidateQueries([KEY]);
    },
  });
};

export const useEditPassword = () => {
  return useMutation<
    IServer<boolean>,
    IError,
    { body: PasswordInput; id: string }
  >({
    mutationFn: ({ body, id }) => updatePassword(body, id),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => deleteUser(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData([KEY], (prevUsers: IUser[] | undefined) =>
          prevUsers
            ? prevUsers.map((user) => ({
                ...user,
                status: user._id === id ? false : user.status,
              }))
            : prevUsers
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: string }>({
    mutationFn: ({ id }) => restoreUser(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData([KEY], (prevUsers: IUser[] | undefined) => {
          return prevUsers
            ? prevUsers.map((user) => ({
                ...user,
                status: user._id === id ? true : user.status,
              }))
            : prevUsers;
        });

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};
