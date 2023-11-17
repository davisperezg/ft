import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ISeries } from "../interface/series.interface";
import { IError } from "../interface/error.interface";
import { getSerie, getSeries, postNewSerie } from "../api/series";
import { IServer } from "../interface/server.interface";

const KEY = "series";

export const useSeries = () => {
  return useQuery<ISeries[], IError>({
    queryKey: [KEY],
    queryFn: async () => await getSeries(),
  });
};

export const useSerie = (id: number) => {
  return useQuery<ISeries, IError>({
    queryKey: [KEY, id],
    queryFn: async () => await getSerie(id),
    enabled: !!id,
  });
};

export const usePostSerie = () => {
  const queryClient = useQueryClient();

  return useMutation<IServer<ISeries>, IError, any>({
    mutationFn: (serie) => postNewSerie(serie),
    onSuccess: ({ response }) => {
      queryClient.setQueryData([KEY], (prevSeries: ISeries[] | undefined) => {
        return prevSeries ? [...prevSeries, response] : [response];
      });

      queryClient.invalidateQueries([KEY]);
    },
  });
};
