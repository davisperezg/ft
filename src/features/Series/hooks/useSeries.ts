import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { IError } from "../../../interfaces/common/error.interface";
import {
  disableSerie,
  enableSerie,
  getSerie,
  getSeries,
  postMigrateSerie,
  postNewSerie,
} from "../services/series";
import { IServer } from "../../../interfaces/common/server.interface";
import {
  ISeries,
  ISeriesMigrate,
} from "../../../interfaces/models/series/series.interface";

export const KEY_SERIES = "series";

export const useSeries = () => {
  return useQuery<ISeries[], IError>({
    queryKey: [KEY_SERIES],
    queryFn: async () => await getSeries(),
  });
};

export const useSerie = (id: number) => {
  const query = useQuery<ISeries, IError>({
    queryKey: [KEY_SERIES, id],
    queryFn: async () => await getSerie(id),
    enabled: !!id,
  });

  return {
    ...query,
    isLoading: query.isLoading && query.fetchStatus !== "idle",
  };
};

export const usePostSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<ISeries>, IError, any>({
    mutationFn: (serie) => postNewSerie(serie),
    onSuccess: async ({ response }) => {
      await queryClient.setQueryData(
        [KEY_SERIES],
        (prevSeries: ISeries[] | undefined) => {
          return prevSeries ? [...prevSeries, response] : [response];
        }
      );

      await queryClient.invalidateQueries({
        queryKey: [KEY_SERIES],
      });
    },
  });
};

export const useMigrateSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<ISeriesMigrate>, IError, any>({
    mutationFn: (serie) => postMigrateSerie(serie),
    onSuccess: async ({ response }) => {
      await queryClient.setQueryData(
        [KEY_SERIES],
        (prevSeries: ISeriesMigrate[] | undefined) => {
          if (prevSeries) {
            const updateSerie = prevSeries.map((serie) => {
              if (serie.empresa === response.empresa)
                return { ...serie, ...response };
              return serie;
            });

            return updateSerie;
          }

          return prevSeries;
        }
      );

      await queryClient.invalidateQueries({
        queryKey: [KEY_SERIES],
      });
    },
  });
};

export const useDisableSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => disableSerie(id),
    onSuccess: async (result) => {
      if (result) {
        await queryClient.invalidateQueries({
          queryKey: [KEY_SERIES],
        });
      }
    },
  });
};

export const useEnableSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => enableSerie(id),
    onSuccess: async (result) => {
      if (result) {
        await queryClient.invalidateQueries({
          queryKey: [KEY_SERIES],
        });
      }
    },
  });
};
