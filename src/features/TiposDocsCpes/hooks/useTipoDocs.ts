import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IError } from "../../../interfaces/common/error.interface";
import {
  disableDocumento,
  disableTipoDocs,
  editTipoDocs,
  enableDocumento,
  enableTipoDocs,
  getAllTipoDocs,
  postTipoDocs,
} from "../services/tipodocs";
import { IServer } from "../../../interfaces/common/server.interface";
import { ITipoDoc } from "../../../interfaces/models/tipo-docs-cpe/tipodocs.interface";

const KEY = "tipodocs";
const KEY_GET_EMPRESA = "get_empresa";

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
        queryClient.setQueryData(
          [KEY],
          (prevTipdocs: ITipoDoc[] | undefined) =>
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

export const useDisableDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => disableDocumento(id),
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries([KEY_GET_EMPRESA]);
      }
    },
  });
};

export const useEnableDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => enableDocumento(id),
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries([KEY_GET_EMPRESA]);
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
