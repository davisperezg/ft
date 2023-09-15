import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IError } from "../interface/error.interface";
import { ITipoDoc } from "../interface/tipodocs.interface";
import {
  disableTipoDocs,
  editTipoDocs,
  enableTipoDocs,
  getAllTipoDocs,
  postTipoDocs,
} from "../api/tipodocs";
import { IServer } from "../interface/server.interface";

const KEY = "tipodocs";

export const useTipoDocs = () => {
  return useQuery<ITipoDoc[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getAllTipoDocs(),
  });
};

export const useDisableTipDoc = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => disableTipoDocs(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData([KEY], (prevTipdocs: ITipoDoc[] | undefined) =>
          prevTipdocs
            ? prevTipdocs.map((tip) => ({
                ...tip,
                estado: tip.id === id ? false : tip.estado,
              }))
            : prevTipdocs
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

export const useEnableTipDoc = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => enableTipoDocs(id),
    onSuccess: (result, { id }) => {
      if (result) {
        queryClient.setQueryData(
          [KEY],
          (prevTipdocs: ITipoDoc[] | undefined) => {
            return prevTipdocs
              ? prevTipdocs.map((tip) => ({
                  ...tip,
                  estado: tip.id === id ? true : tip.estado,
                }))
              : prevTipdocs;
          }
        );

        queryClient.invalidateQueries([KEY]);
      }
    },
  });
};

export const usePostTipDoc = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<ITipoDoc>, IError, ITipoDoc>({
    mutationFn: (tip) => postTipoDocs(tip),
    onSuccess: ({ response }) => {
      queryClient.setQueryData([KEY], (prevTipdocs: ITipoDoc[] | undefined) =>
        prevTipdocs ? [...prevTipdocs, response] : [response]
      );

      queryClient.invalidateQueries([KEY]);
    },
  });
};

export const useEditTipDoc = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<ITipoDoc>, IError, { body: ITipoDoc; id: number }>(
    {
      mutationFn: ({ body, id }) => editTipoDocs(body, id),
      onSuccess: ({ response }) => {
        queryClient.setQueryData(
          [KEY],
          (prevTipdocs: ITipoDoc[] | undefined) => {
            if (prevTipdocs) {
              const updatedTip = prevTipdocs.map((tip) => {
                if (tip.id === response.id) return { ...tip, ...response };
                return tip;
              });

              return updatedTip;
            }

            return prevTipdocs;
          }
        );

        queryClient.invalidateQueries([KEY]);
      },
    }
  );
};
