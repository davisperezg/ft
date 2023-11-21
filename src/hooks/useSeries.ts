import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ISeries } from "../interface/series.interface";
import { IError } from "../interface/error.interface";
import { getSerie, getSeries, postNewSerie } from "../api/series";
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
