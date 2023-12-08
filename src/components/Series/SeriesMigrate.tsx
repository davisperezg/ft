import { useContext, useState } from "react";
import { DialogBeta } from "../Dialog/DialogBasic";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import { ModalContext } from "../../context/modalContext";
import { Box, Button, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { IOption, SelectSimple } from "../Select/SelectSimple";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import {
  useEmpresas,
  useEstablecimientosByEmpresa,
} from "../../hooks/useEmpresa";
import { PropsValue, SingleValue } from "react-select";
import {
  ISeriesMigrate,
  ITransferListOf,
} from "../../interface/series.interface";
import { FORM_INITIAL_SERIES_MIGRATE } from "../../utils/initials";
import { yupResolver } from "@hookform/resolvers/yup";
import { schemaFormSeriesMigrate } from "../../utils/yup_validations";
import TransferList from "../Material/TransferList/Index";
import { useMigrateSerie, useSerie } from "../../hooks/useSeries";
import CachedIcon from "@mui/icons-material/Cached";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import { toast } from "react-toastify";
import { ITipoDocsExtentido } from "../../interface/tipodocs.interface";

const initialCard: ITransferListOf = {
  nombre: "Seleccione documento",
  series: [],
};

const SeriesMigrate = () => {
  const { dispatch, dialogState } = useContext(ModalContext);
  const [seriesOf, setSeriesOf] = useState<ITransferListOf>(initialCard);

  const methods = useForm<ISeriesMigrate>({
    defaultValues: FORM_INITIAL_SERIES_MIGRATE,
    resolver: yupResolver(schemaFormSeriesMigrate),
    mode: "all",
  });

  const {
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { isDirty, isValid, errors },
    trigger,
    watch,
  } = methods;

  const {
    data: dataEmpresas,
    isLoading: isLoadingEmpresas,
    error: errorEmpresas,
    isError: isErrorEmpresa,
  } = useEmpresas();

  const {
    data: dataEstablecimientos,
    isLoading: isLoadingEstablecimientos,
    error: errorEstablecimientos,
    isError: isErrorEstablecimientos,
    refetch: refetchEstablecimientos,
    isRefetching: isRefetchingEstablecimientos,
  } = useEstablecimientosByEmpresa(getValues("empresa"));

  const {
    data: dataSeries,
    isLoading: isLoadingSeries,
    error: errorSeries,
    isError: isErrorSeries,
  } = useSerie(getValues("empresa"));

  const { mutateAsync: mutateSerieAsync, isLoading: isLoadingSerie } =
    useMigrateSerie();

  const onSubmit: SubmitHandler<ISeriesMigrate> = async (values) => {
    const { empresa, documentos, establecimiento_destino } = values;
    const mapDocuments = documentos?.reduce((acc, item) => {
      const groupDocs = documentos.filter(
        (doc) => doc.idDocumento === item.idDocumento
      );

      if (groupDocs.length > 0) {
        return {
          ...acc,
          [item.idDocumento]: groupDocs.map((doc) => doc.serie),
        };
      }

      return acc;
    }, {});

    try {
      const res = await mutateSerieAsync({
        empresa,
        establecimiento: establecimiento_destino,
        documentos: mapDocuments,
      });
      toast.success(res.message);
      dispatch({ type: "INIT" });
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
  };

  const listEmpresas =
    dataEmpresas?.map((item) => ({
      value: Number(item.id),
      label: item.razon_social,
    })) || [];

  const listEstablecimientos =
    dataEstablecimientos?.map((item) => ({
      value: Number(item.id),
      label: `${item.codigo === "0000" ? "PRINCIPAL" : item.codigo} - ${
        item.denominacion
      }`,
    })) || [];

  const obtenerDocumentosXEstablecimiento = (
    establecimiento: number
  ): ITipoDocsExtentido[] => {
    const listDocs = dataSeries?.establecimientos?.find(
      (item) => item.id === establecimiento
    );

    return (
      listDocs?.documentos?.map((doc) => {
        return {
          id: doc.id,
          nombre: doc.nombre,
          estado: !doc.estado,
          codigo: listDocs?.codigo, // Add the missing 'codigo' property
          series: doc.series.map((item) => {
            return {
              id: item.id,
              serie: item.serie,
              aliasEstablecimiento:
                listDocs?.codigo === "0000" ? "PRINCIPAL" : listDocs?.codigo,
            };
          }),
        };
      }) || []
    );
  };

  const establecimientosOrigenDisponibles = listEstablecimientos.filter(
    (item) => item.value !== watch("establecimiento_destino")
  );

  const establecimientosDestinoDisponibles = listEstablecimientos.filter(
    (item) => item.value !== watch("establecimiento")
    //&& !item.label.toString().startsWith("PRINCIPAL")
  );

  const resetEstablecimientos = async () => {
    await trigger();
    refetchEstablecimientos();
    setValue("establecimiento", 0);
    setValue("establecimiento_destino", 0);
    setSeriesOf(initialCard);
  };

  return (
    <DialogBeta open={dialogState.open}>
      <DialogTitleBeta>Migrar serie</DialogTitleBeta>
      <IconButton
        aria-label="close"
        onClick={() => dispatch({ type: "INIT" })}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          padding: "3px",
          height: 18,
          fontSize: "16px",
          color: "#fff",
        }}
      >
        <CloseIcon sx={{ width: "16px", height: "16px" }} />
      </IconButton>

      <DialogContentBeta>
        <Box sx={{ width: "100%", padding: 2 }}>
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="empresa"
                  control={control}
                  render={({ field }) => {
                    return (
                      <SelectSimple
                        {...field}
                        className="empresa-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        isLoading={isLoadingEmpresas}
                        options={listEmpresas}
                        placeholder="Seleccione empresa"
                        error={!!errors.empresa || isErrorEmpresa}
                        helperText={
                          errors.empresa?.message ||
                          errorEmpresas?.response.data.message
                        }
                        value={listEmpresas.find(
                          ({ value }) => Number(value) === field.value
                        )}
                        onChange={(e) => {
                          const value = (e as SingleValue<IOption>)?.value ?? 0;

                          if (field.value === 0) {
                            field.onChange(value);
                          } else {
                            if (field.value !== 0 && value !== field.value) {
                              const mensaje = confirm(
                                "Si cambias de empresa se perderan las series agregadas, ¿Desea continuar?"
                              );
                              if (mensaje) {
                                resetEstablecimientos();
                                field.onChange(value);
                              }
                            }
                          }
                        }}
                      />
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <label className="text-[11px]">
                  Establecimiento origen:{" "}
                  <CachedIcon
                    onClick={() => {
                      const mensaje = confirm(
                        "Si reinicias los establecimientos se perderan las series agregadas, ¿Desea continuar?"
                      );
                      if (mensaje) {
                        return (
                          !isLoadingEstablecimientos && resetEstablecimientos()
                        );
                      }
                    }}
                    className={`${
                      isRefetchingEstablecimientos
                        ? "animate-spin"
                        : "cursor-pointer"
                    }`}
                  />
                </label>
                <Controller
                  name="establecimiento"
                  control={control}
                  render={({ field }) => {
                    return (
                      <SelectSimple
                        {...field}
                        className="establecimiento-single"
                        classNamePrefix="select"
                        isSearchable={false}
                        isLoading={isLoadingEstablecimientos}
                        options={establecimientosOrigenDisponibles}
                        placeholder="Seleccione establecimiento origen"
                        error={
                          !!errors.establecimiento || isErrorEstablecimientos
                        }
                        helperText={
                          errors.establecimiento?.message ||
                          errorEstablecimientos?.response.data.message
                        }
                        value={
                          field.value === 0
                            ? ""
                            : (listEstablecimientos.find(
                                ({ value }) => Number(value) === field.value
                              ) as PropsValue<any>)
                        }
                        onChange={(e) => {
                          const value = (e as SingleValue<IOption>)?.value ?? 0;

                          setSeriesOf(initialCard);
                          field.onChange(value);
                        }}
                      />
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <label className="text-[11px] text-green-800">
                  Establecimiento destino:
                </label>
                <Controller
                  name="establecimiento_destino"
                  control={control}
                  render={({ field }) => {
                    return (
                      <SelectSimple
                        {...field}
                        className="establecimiento_destino-single"
                        classNamePrefix="select"
                        isSearchable={false}
                        isLoading={isLoadingEstablecimientos}
                        options={establecimientosDestinoDisponibles}
                        placeholder="Seleccione establecimiento destino"
                        error={
                          !!errors.establecimiento_destino ||
                          isErrorEstablecimientos
                        }
                        helperText={
                          errors.establecimiento_destino?.message ||
                          errorEstablecimientos?.response.data.message
                        }
                        noOptionsMessage={() => {
                          return establecimientosDestinoDisponibles.length === 0
                            ? "La empresa no cuenta no más establecimientos disponibles."
                            : "La empresa no cuenta con establecimientos.";
                        }}
                        value={
                          field.value === 0
                            ? ""
                            : (listEstablecimientos.find(
                                ({ value }) => Number(value) === field.value
                              ) as PropsValue<any>)
                        }
                        onChange={(e) => {
                          const value = (e as SingleValue<IOption>)?.value ?? 0;
                          field.onChange(value);
                        }}
                      />
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <div className="bg-yellow-100 p-1 border border-yellow-600 rounded-[5px]">
                  <span className="text-yellow-600 text-[13px]">
                    Nota: No debe migrar series que ya pertecen al mismo
                    establecimiento destino.
                  </span>
                </div>
              </Grid>
              <Grid item container>
                <Grid item xs={3}>
                  <div className="flex flex-col h-full border px-2 py-2">
                    {isLoadingSeries && (
                      <div className="break-words">
                        <span>Cargando documentos...</span>
                      </div>
                    )}
                    {isErrorSeries && (
                      <div className="break-words">
                        <span className="text-primary">
                          {errorSeries?.response.data.message}
                        </span>
                      </div>
                    )}
                    <ul>
                      {obtenerDocumentosXEstablecimiento(
                        getValues("establecimiento")
                      )?.map((doc) => {
                        return (
                          <li key={doc.id}>
                            <button
                              type="button"
                              onClick={() => {
                                /**
                                 * Si el establecimiento destino tiene series
                                 * se filtra las series del establecimiento origen
                                 * que no esten en el establecimiento destino
                                 * y se setea en el estado seriesOf
                                 * caso contrario se setea las series del establecimiento origen
                                 * en el estado seriesOf
                                 */
                                const documentos = getValues("documentos");
                                if (documentos?.length > 0) {
                                  const seriesLibresOrigen = doc.series.filter(
                                    (item1: any) =>
                                      !documentos?.some(
                                        (item2: any) =>
                                          item1.serie === item2.serie
                                      )
                                  );

                                  if (seriesLibresOrigen.length > 0) {
                                    setSeriesOf({
                                      nombre: doc.nombre,
                                      series: seriesLibresOrigen.map(
                                        (serie) => {
                                          return {
                                            idDocumento: Number(doc.id),
                                            serie: serie.serie,
                                            establecimiento:
                                              serie.aliasEstablecimiento,
                                          };
                                        }
                                      ),
                                    });
                                  } else {
                                    setSeriesOf({
                                      nombre: doc.nombre,
                                      series: [],
                                    });
                                  }
                                } else {
                                  //Si el estalecimiento destino no tiene series
                                  //se setea todas las series del establecimiento origen
                                  const mapSeriesOf = {
                                    nombre: doc.nombre,
                                    series: doc.series.map((serie) => {
                                      return {
                                        idDocumento: Number(doc.id),
                                        serie: serie.serie,
                                        establecimiento:
                                          serie.aliasEstablecimiento,
                                      };
                                    }),
                                  };
                                  setSeriesOf(mapSeriesOf);
                                }
                              }}
                              className={`bg-transparent ${
                                doc.estado ? "text-hover" : "cursor-pointer"
                              }`}
                              disabled={doc.estado}
                            >
                              {doc.nombre}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </Grid>
                <Grid item xs={9}>
                  <TransferList
                    seriesOf={seriesOf}
                    isReset={isRefetchingEstablecimientos}
                    control={control}
                    setValue={setValue}
                  />
                </Grid>
              </Grid>
              {/* <Grid item xs={4}>
                <Controller
                  name="documento"
                  control={control}
                  render={({ field }) => {
                    const option = field.value;
                    return (
                      <SelectSimple
                        {...field}
                        className="documento-single"
                        classNamePrefix="select"
                        isSearchable={false}
                        isLoading={isLoadingDocumentos}
                        options={listDocumentos}
                        placeholder="Seleccione documento"
                        error={!!errors.documento || isErrorDocumentos}
                        isOptionDisabled={(option) => Boolean(option.disabled)}
                        helperText={
                          errors.documento?.value?.message ||
                          errorDocumentos?.response.data.message
                        }
                        value={
                          option?.value === ""
                            ? ""
                            : (listDocumentos.find(
                                ({ value }) =>
                                  Number(value) === Number(option?.value)
                              ) as PropsValue<any>)
                        }
                        noOptionsMessage={() =>
                          "Probablemente la empresa no cuenta con documentos disponibles."
                        }
                      />
                    );
                  }}
                />
              </Grid> */}
            </Grid>
          </form>
        </Box>
      </DialogContentBeta>
      <DialogActionsBeta>
        <Button
          size="small"
          className="text-textDefault"
          variant="text"
          color="secondary"
          onClick={() => dispatch({ type: "INIT" })}
        >
          Cancelar
        </Button>
        <Button
          disabled={isLoadingSerie || !isDirty || !isValid}
          onClick={(e) => handleSubmit(onSubmit)(e)}
          size="small"
          variant="contained"
          color="primary"
        >
          OK
        </Button>
      </DialogActionsBeta>
    </DialogBeta>
  );
};

export default SeriesMigrate;
