import { ISeries } from "../../interface/series.interface";
import { DialogBeta } from "../Dialog/DialogBasic";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Grid, IconButton } from "@mui/material";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import {
  SubmitHandler,
  useForm,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { schemaFormSeries } from "../../utils/yup_validations";
import { IOption, SelectSimple } from "../Select/SelectSimple";
import { useDocumentosByEmpresa } from "../../hooks/useEmpresa";
import {
  useDisableSerie,
  useEnableSerie,
  usePostSerie,
  useSerie,
} from "../../hooks/useSeries";
import { PropsValue, SingleValue } from "react-select";
import InputText from "../Material/Input/InputText";
import LoadingTotal from "../Loading/LoadingTotal";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  data: ISeries;
  closeEdit: () => void;
}

const SeriesEdit = ({ data, closeEdit }: Props) => {
  const { dispatch, dialogState } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  const {
    data: dataSeries,
    isLoading: isLoadingSeries,
    error: errorSeries,
    isError: isErrorSeries,
  } = useSerie(Number(data.id));

  const methods = useForm<ISeries>({
    values: {
      empresa: Number(data.id),
      establecimiento: 0,
      documento: {
        value: "",
        label: "",
      },
      serie: "",
      documentos: [],
    },
    resolver: yupResolver(schemaFormSeries),
    mode: "all",
  });

  const {
    setValue,
    getValues,
    control,
    handleSubmit,
    formState: { isDirty, isValid, errors },
    trigger,
  } = methods;

  const {
    data: dataDocumentos,
    isLoading: isLoadingDocumentos,
    error: errorDocumentos,
    isError: isErrorDocumentos,
  } = useDocumentosByEmpresa(Number(data.id));

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "documentos",
    keyName: "uuid",
  });

  const listEstablecimientos =
    dataSeries?.establecimientos?.map((item) => ({
      value: Number(item.id),
      label: `${item.codigo === "0000" ? "PRINCIPAL" : item.codigo} - ${
        item.denominacion
      }`,
    })) || [];

  const listDocumentos =
    dataDocumentos?.map((item) => ({
      value: Number(item.id),
      label: item.nombre,
      disabled: !item.estado,
    })) || [];

  const { mutateAsync: mutateSerieAsync, isLoading: isLoadingSerie } =
    usePostSerie();

  const { mutateAsync: mutateDisable } = useDisableSerie();

  const { mutateAsync: mutateEnable } = useEnableSerie();

  const onSubmit: SubmitHandler<ISeries> = async (values) => {
    const { documentos, empresa, establecimiento } = values;

    const mapDocuments = documentos?.reduce((acc, item) => {
      if (item.series.length > 0) {
        const series = item.series
          .filter((serie: any) => serie.new)
          .map((item: any) => item.serie);

        if (series.length > 0) {
          return {
            ...acc,
            [item.id]: series,
          };
        }
      }

      return acc;
    }, {});

    const isEmpty = Object.keys(mapDocuments).length === 0;
    if (isEmpty) return alert("No hay series para agregar.");

    try {
      const res = await mutateSerieAsync({
        empresa,
        establecimiento,
        documentos: mapDocuments,
      });
      toast.success(res.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
  };

  const appendDocumento = async () => {
    // Usa trigger para verificar manualmente los errores del formulario
    const formIsValid = await trigger();

    if (!formIsValid) return;

    const serie = getValues("serie");
    const documento = getValues("documento");

    //Validamos si la serie que se estan ingresando pertecene a otro establecimiento de la empresa
    const existSerieEstablecimiento =
      validarSerieExixtenteXEstablecimiento(serie);
    if (existSerieEstablecimiento) return;

    const existDocumento = fields.find((item) => item.id === documento?.value);

    //Si agrega el mismo documento debe validar que no exista la serie para que la agregue
    if (existDocumento) {
      const existSerieIngresada = existDocumento.series.find(
        (item: any) => item.serie === serie
      );
      if (existSerieIngresada) {
        return alert("Ya existe la serie.");
      }

      const index = fields.findIndex(
        (item: any) => item.id === documento?.value
      );
      return update(index, {
        ...existDocumento,
        series: [...existDocumento.series, { new: true, serie }],
      });
    }

    return append({
      id: getValues("documento")?.value,
      nombre: getValues("documento")?.label,
      series: [
        {
          serie: getValues("serie"),
          new: true,
        },
      ],
    });
  };

  const removeSerie = (item: any, serie: string) => {
    const documento = item;
    const existDocumento = fields.find((item) => item.id === documento.id);

    if (existDocumento) {
      const index = fields.findIndex((item: any) => item.id === documento.id);
      console.log(index);
      const newSeries = existDocumento.series.filter(
        (item: any) => item.serie !== serie
      );

      return update(index, {
        ...existDocumento,
        series: newSeries,
      });
    }
  };

  const validarSerieExixtenteXEstablecimiento = (inputSerie: string) => {
    const establecimientos =
      dataSeries && dataSeries.establecimientos
        ? dataSeries.establecimientos.length
        : 0;

    let estado = false;

    for (let a = 0; a < establecimientos; a++) {
      const establecimiento = dataSeries?.establecimientos?.[a];
      if (establecimiento) {
        for (let b = 0; b < establecimiento.documentos.length; b++) {
          const est_documento = establecimiento.documentos[b];
          for (let c = 0; c < est_documento.series.length; c++) {
            const doc_serie = est_documento.series[c];
            if (
              doc_serie.serie === inputSerie &&
              getValues("establecimiento") !== establecimiento.id
            ) {
              estado = true;
              alert(
                "La serie ya existe en otro establecimiento de la empresa. Si quieres que pertenezca a este establecimiento debes migrar la serie."
              );
            }
          }
        }
      }
    }

    return estado;
  };

  const obtenerSeriesXEstablecimiento = (establecimiento: number) => {
    const listDocs = dataSeries?.establecimientos?.find(
      (item) => item.id === establecimiento
    );
    return listDocs?.documentos?.map((docs: any) => {
      return {
        id: docs.id,
        nombre: docs.nombre,
        series: docs.series,
      };
    });
  };

  const obtenerQueryDocumentosByEstablecimiento = () => {
    const listDocs: ISeries | undefined = queryClient.getQueryData([
      "series",
      getValues("empresa"),
    ]);

    if (listDocs) {
      return listDocs.establecimientos?.find(
        (est: any) => est.id === getValues("establecimiento")
      );
      //documentos.find((doc: any) => doc.id === idDocumento);
    }
    return null;
  };

  const activar = async (idSerie: number, documento: any) => {
    try {
      await mutateEnable({ id: idSerie });
      const query = obtenerQueryDocumentosByEstablecimiento();
      const indexQuery = query?.documentos.findIndex(
        (item: any) => item.id === documento.id
      );
      const queryDocumento = query?.documentos.find(
        (doc: any) => doc.id === documento.id
      );

      return update(Number(indexQuery), {
        ...documento,
        series: queryDocumento?.series,
      });
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const desactivar = async (idSerie: number, documento: any) => {
    //console.log(obtenerSeriesXEstablecimiento(establecimiento));
    try {
      await mutateDisable({ id: idSerie });
      const query = obtenerQueryDocumentosByEstablecimiento();
      const indexQuery = query?.documentos.findIndex(
        (item: any) => item.id === documento.id
      );
      const queryDocumento = query?.documentos.find(
        (doc: any) => doc.id === documento.id
      );

      return update(Number(indexQuery), {
        ...documento,
        series: queryDocumento?.series,
      });
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };
  //console.log(dataSeries);

  return (
    <DialogBeta open={dialogState.open}>
      <DialogTitleBeta>Editar {data.empresa}</DialogTitleBeta>
      <IconButton
        aria-label="close"
        onClick={closeModal}
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
                <h2>
                  <strong>Empresa: </strong>
                  {data.empresa}
                </h2>
              </Grid>
              <Grid item xs={12}>
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
                        isLoading={isLoadingSerie}
                        options={listEstablecimientos}
                        placeholder="Seleccione establecimiento"
                        error={!!errors.establecimiento || isErrorSeries}
                        helperText={
                          errors.establecimiento?.message ||
                          errorSeries?.response.data.message
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

                          const series = obtenerSeriesXEstablecimiento(
                            Number(value)
                          );

                          if (field.value === 0) {
                            field.onChange(value);
                            if (series) append(series);
                          } else {
                            if (value !== field.value) {
                              const mensaje = confirm(
                                "Si cambias de establecimiento se perderan las series agregadas, ¿Desea continuar?"
                              );

                              if (mensaje) {
                                field.onChange(value);
                                remove();
                                setValue("serie", "");
                                if (series) append(series);
                              }
                            }
                          }
                        }}
                      />
                    );
                  }}
                />
              </Grid>
              <Grid item xs={4}>
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
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="serie"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      hiddenLabel
                      variant="filled"
                      error={!!errors.serie}
                      helperText={errors.serie?.message}
                      inputProps={{ maxLength: 4 }}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <div className="pt-[2px] w-full flex justify-end">
                  <button
                    onClick={appendDocumento}
                    className="flex items-center justify-center h-[20px] hover:bg-hover text-center bg-default w-1/3"
                    type="button"
                  >
                    Agregar
                  </button>
                </div>
              </Grid>
            </Grid>
          </form>
          <div className="w-full mt-5">
            <small>
              Nota: Para crear una serie verifica que no exista en otro
              establecimiento, si deseas migrar serie puedes migrarlo desde el
              panel con la opcion Migrar Series.
            </small>
          </div>
          {isErrorSeries && (
            <span className="text-primary">
              {errorSeries.response.data.message}
            </span>
          )}
          {isLoadingSeries ? (
            <LoadingTotal />
          ) : (
            fields.map((item, index) => {
              return (
                <div
                  key={item.uuid}
                  className={`flex ${
                    index === 0 ? "mt-5 py-2 border-t" : "py-2"
                  } gap-5 border-b`}
                >
                  <div className="w-1/3 text-center flex justify-center items-center">
                    Tipo: {String(item.nombre).toUpperCase()}
                  </div>
                  <div className="w-2/3 flex flex-col justify-center items-center gap-1">
                    {item.series?.map((ser: any, i: number) => {
                      return (
                        <div key={i} className="w-full flex gap-2">
                          <div className="w-2/3 flex flex-col justify-center items-center">
                            Serie: {ser.serie}
                          </div>
                          <div className="flex flex-1 text-center justify-center">
                            {ser.estado ? (
                              <CheckIcon
                                onClick={() => desactivar(Number(ser.id), item)}
                                className="w-full h-8 text-green-700 cursor-pointer"
                              />
                            ) : ser.new ? (
                              <button
                                onClick={() => removeSerie(item, ser.serie)}
                                className="w-full text-center border border-primary text-primary h-[30px]"
                                type="button"
                              >
                                Eliminar
                              </button>
                            ) : (
                              <RemoveIcon
                                onClick={() => activar(Number(ser.id), item)}
                                className="w-full h-8 text-primary cursor-pointer"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </Box>
      </DialogContentBeta>
      <DialogActionsBeta>
        <Button
          size="small"
          className="text-textDefault"
          variant="text"
          color="secondary"
          onClick={closeModal}
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

export default SeriesEdit;
