import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ISeries, ISeriesMigrate } from "../interface/series.interface";
import { IError } from "../interface/error.interface";
import {
  disableSerie,
  enableSerie,
  getSerie,
  getSeries,
  postMigrateSerie,
  postNewSerie,
} from "../api/series";
import { IServer } from "../interface/server.interface";

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
    onSuccess: ({ response }) => {
      queryClient.setQueryData(
        [KEY_SERIES],
        (prevSeries: ISeries[] | undefined) => {
          return prevSeries ? [...prevSeries, response] : [response];
        }
      );

      queryClient.invalidateQueries([KEY_SERIES]);
    },
  });
};

export const useMigrateSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<ISeriesMigrate>, IError, any>({
    mutationFn: (serie) => postMigrateSerie(serie),
    onSuccess: ({ response }) => {
      queryClient.setQueryData(
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

      queryClient.invalidateQueries([KEY_SERIES]);
    },
  });
};

export const useDisableSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => disableSerie(id),
    onSuccess: async (result, { id }) => {
      if (result) {
        await queryClient.invalidateQueries([KEY_SERIES]);
      }
    },
  });
};

export const useEnableSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, IError, { id: number }>({
    mutationFn: ({ id }) => enableSerie(id),
    onSuccess: async (result, { id }) => {
      if (result) {
        await queryClient.invalidateQueries([KEY_SERIES]);
      }
    },
  });
};
