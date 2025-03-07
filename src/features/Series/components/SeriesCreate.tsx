import { Box, Button, Grid, IconButton } from "@mui/material";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import { useContext } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import CloseIcon from "@mui/icons-material/Close";

import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import {
  SubmitHandler,
  useForm,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import {
  IOption,
  SelectSimple,
} from "../../../components/common/Selects/SelectSimple";
import {
  useDocumentosByEmpresa,
  useEmpresas,
  useEstablecimientosByEmpresa,
  usePosByEstablishment,
} from "../../Empresa/hooks/useEmpresa";
import InputText from "../../../components/Material/Input/InputText";
import { usePostSerie, useSerie } from "../hooks/useSeries";
import { toast } from "sonner";
import { isError } from "../../../utils/functions.utils";
import { PropsValue, SingleValue } from "react-select";
import LoadingTotal from "../../../components/common/Loadings/LoadingTotal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FORM_INITIAL_SERIES } from "../../../config/constants";
import { schemaFormSeries } from "../validations/serie.schema";
import { ISeries } from "../../../interfaces/models/series/series.interface";
import { IFormSeriesCreate } from "../../../interfaces/forms/series/series.interface";

const SeriesCreate = () => {
  const { dispatch, dialogState } = useContext(ModalContext);

  const methods = useForm<ISeries>({
    defaultValues: FORM_INITIAL_SERIES,
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

  const watch = useWatch({
    control,
  });

  const {
    data: dataEmpresas,
    isLoading: isLoadingEmpresas,
    error: errorEmpresas,
    isError: isErrorEmpresa,
  } = useEmpresas();

  const {
    data: dataSeries,
    isLoading: isLoadingSeries,
    error: errorSeries,
    isError: isErrorSeries,
  } = useSerie(Number(watch.empresa));

  const {
    data: dataEstablecimientos,
    isLoading: isLoadingEstablecimientos,
    error: errorEstablecimientos,
    isError: isErrorEstablecimientos,
  } = useEstablecimientosByEmpresa(Number(watch.empresa));

  const {
    data: dataDocumentos,
    isLoading: isLoadingDocumentos,
    error: errorDocumentos,
    isError: isErrorDocumentos,
  } = useDocumentosByEmpresa(Number(watch.empresa));

  const {
    data: dataPos,
    isLoading: isLoadingPos,
    error: errorPos,
    isError: isErrorPos,
  } = usePosByEstablishment(Number(watch.establecimiento));

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "items",
    keyName: "uuid",
  });

  const { mutateAsync: mutateSerieAsync, isPending: isLoadingSerie } =
    usePostSerie();

  const onSubmit: SubmitHandler<ISeries> = async (values) => {
    const { items, empresa, establecimiento } = values;

    const sendDataItems =
      items?.map((item: any) => {
        return {
          ...item.pos,
          documentos: item.documentos.map((item: any) => {
            return {
              ...item,
              series: item.series.map((item: any) => {
                return {
                  serie: item.serie,
                  id: item.id,
                };
              }),
            };
          }),
        };
      }) || [];

    if (sendDataItems.length === 0)
      return toast.error("No hay series para agregar.");

    const data: IFormSeriesCreate = {
      empresa,
      establecimiento,
      pos: sendDataItems,
    };

    try {
      const res = await mutateSerieAsync(data);
      toast.success(res.message);
      dispatch({ type: "INIT" });
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const listEmpresas =
    dataEmpresas?.map((item) => ({
      value: Number(item.id),
      label: item.razon_social,
      disabled: !item.estado,
    })) ?? [];

  const listEstablecimientos =
    dataEstablecimientos?.map((item) => {
      const establishmentCode =
        item.codigo === "0000" ? "PRINCIPAL" : item.codigo;

      return {
        value: Number(item.id),
        label: `[${establishmentCode}]:${item.denominacion}`,
        disabled: !item.estado,
      };
    }) ?? [];

  const listPos =
    dataPos?.map((item) => {
      const establishment =
        item.establecimiento.codigo === "0000"
          ? "PRINCIPAL"
          : item.establecimiento.codigo;

      return {
        value: Number(item.id),
        label: `[${establishment}]:[${item.codigo}]: ${item.nombre}`,
        disabled: !item.estado,
      };
    }) ?? [];

  const listDocumentos =
    dataDocumentos?.map((item) => ({
      value: Number(item.id),
      label: item.nombre,
      disabled: !item.estado,
    })) ?? [];

  const appendDocumento = async () => {
    // Verifica los errores del formulario
    const formIsValid = await trigger();
    if (!formIsValid) return;

    // Obtener valores del formulario
    const serie = getValues("serie");
    const documento = getValues("documento");
    const pos = getValues("pos");

    if (!documento || !pos) return toast.error("Documento o POS no válidos");

    // Validar si la serie ya existe en CUALQUIER establecimiento (POS)
    const serieExistente = fields.some((posItem) =>
      posItem.documentos.some((doc: any) =>
        doc.series.some((s: any) => s.serie === serie)
      )
    );

    if (serieExistente) {
      return toast.error(
        "Esta serie ya está agregada en otro establecimiento."
      );
    }

    // Validar si la serie pertenece a otro establecimiento de la empresa
    if (validarSerieExixtenteXEstablecimiento(serie)) return;

    // Buscar si ya existe el POS en `fields`
    const existPos = fields.find((item) => item.pos.id === pos.value);

    if (existPos) {
      // Verificar si el documento ya está en ese POS
      const existDocumento = existPos.documentos?.find(
        (doc: any) => doc.id === documento.value
      );

      if (existDocumento) {
        // Verificar si la serie ya existe dentro del documento
        if (existDocumento.series.some((item: any) => item.serie === serie)) {
          return toast.error("Ya existe la serie.");
        }

        // Agregar la nueva serie al documento existente
        existDocumento.series.push({ new: true, serie });
      } else {
        // Agregar un nuevo documento dentro del POS existente
        existPos.documentos.push({
          id: documento.value,
          nombre: documento.label,
          series: [{ serie, new: true }],
        });
      }

      // Actualizar la lista de documentos
      return update(fields.indexOf(existPos), { ...existPos });
    }

    // Si no existe el POS, agregarlo con el nuevo documento
    const item = {
      pos: {
        id: pos.value,
        nombre: pos.label,
      },
      documentos: [
        {
          id: documento.value,
          nombre: documento.label,
          series: [{ serie, new: true }],
        },
      ],
    };

    return append(item);
  };

  const removeSerie = (posIndex: number, docIndex: number, serie: string) => {
    const posItem = fields[posIndex]; // Obtener el POS
    const docItem = posItem.documentos[docIndex]; // Obtener el documento dentro del POS

    // Filtrar las series, eliminando la que coincide con el valor
    const updatedSeries = docItem.series.filter((s: any) => s.serie !== serie);

    if (updatedSeries.length > 0) {
      // Si el documento aún tiene series, actualizamos solo las series
      update(posIndex, {
        ...posItem,
        documentos: posItem.documentos.map((doc: any, i: number) =>
          i === docIndex ? { ...doc, series: updatedSeries } : doc
        ),
      });
    } else {
      // Si el documento se queda sin series, lo eliminamos del POS
      const updatedDocuments = posItem.documentos.filter(
        (_: any, i: number) => i !== docIndex
      );

      if (updatedDocuments.length > 0) {
        // Si el POS aún tiene documentos, lo actualizamos
        update(posIndex, {
          ...posItem,
          documentos: updatedDocuments,
        });
      } else {
        // Si el POS se queda sin documentos, lo eliminamos completamente
        remove(posIndex);
      }
    }
  };

  const validarSerieExixtenteXEstablecimiento = (inputSerie: string) => {
    const establecimientos = dataSeries?.establecimientos || [];

    let estado = false;

    for (let index = 0; index < establecimientos.length; index++) {
      const establishment = establecimientos[index];
      if (establishment) {
        for (const pos of establishment.pos) {
          for (const document of pos.documentos) {
            for (const serie of document.series) {
              if (
                serie.serie === inputSerie &&
                getValues("establecimiento") !== establishment.id
              ) {
                estado = true;
                toast.error(
                  "La serie ya existe en otro establecimiento de la empresa. Si quieres que pertenezca a este establecimiento debes migrar la serie."
                );
              }
            }
          }
        }
      }
    }

    return estado;
  };

  const obtenerSeriesXEstablecimiento = (establecimiento: number) => {
    const listEstablishment = dataSeries?.establecimientos?.find(
      (item) => item.id === establecimiento
    );

    return listEstablishment?.pos?.map((pos) => {
      return {
        pos: {
          id: pos.id,
          nombre: pos.nombre,
        },
        documentos: pos.documentos.map((doc) => {
          return {
            id: doc.id,
            nombre: doc.nombre,
            series: doc.series,
          };
        }),
      };
    });
  };

  return (
    <DialogBeta open={dialogState.open}>
      <DialogTitleBeta>Crear serie</DialogTitleBeta>
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
                        isOptionDisabled={(option) => Boolean(option.disabled)}
                        error={!!errors.empresa || isErrorEmpresa}
                        helperText={
                          errors.empresa?.message ??
                          errorEmpresas?.response.data.message
                        }
                        value={listEmpresas.find(
                          ({ value }) => Number(value) === field.value
                        )}
                        onChange={(e) => {
                          const value = (e as SingleValue<IOption>)?.value ?? 0;
                          field.onChange(value);
                          if (field.value !== 0 && value !== field.value) {
                            const mensaje = confirm(
                              "Si cambias de empresa se perderan las series agregadas, ¿Desea continuar?"
                            );
                            if (mensaje) {
                              remove();
                              setValue("establecimiento", 0);
                              setValue("pos", {
                                label: "",
                                value: "",
                              });
                              setValue("documento", {
                                label: "",
                                value: "",
                              });
                              setValue("serie", "");
                            }
                          }
                        }}
                      />
                    );
                  }}
                />
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
                        isLoading={isLoadingEstablecimientos}
                        options={listEstablecimientos}
                        isOptionDisabled={(option) => Boolean(option.disabled)}
                        placeholder="Seleccione establecimiento"
                        error={
                          !!errors.establecimiento || isErrorEstablecimientos
                        }
                        helperText={
                          errors.establecimiento?.message ??
                          errorEstablecimientos?.response.data.message
                        }
                        value={
                          field.value === 0
                            ? ""
                            : (listEstablecimientos.find(
                                ({ value }) =>
                                  Number(value) === Number(field.value)
                              ) as PropsValue<any>)
                        }
                        onChange={(e) => {
                          const value = (e as SingleValue<IOption>)?.value ?? 0;

                          const series = obtenerSeriesXEstablecimiento(
                            Number(value)
                          );

                          console.log(series);

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
                                setValue("pos", {
                                  label: "",
                                  value: "",
                                });
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
              <Grid item xs={12}>
                <Controller
                  name="pos"
                  control={control}
                  render={({ field }) => {
                    const option = field.value;
                    return (
                      <SelectSimple
                        {...field}
                        className="pos-single"
                        classNamePrefix="select"
                        isSearchable={false}
                        isLoading={isLoadingPos}
                        options={listPos}
                        isOptionDisabled={(option) => Boolean(option.disabled)}
                        placeholder="Seleccione POS"
                        error={!!errors.pos || isErrorPos}
                        helperText={
                          errors.pos?.value?.message ??
                          errorPos?.response.data.message
                        }
                        value={
                          option?.value === ""
                            ? ""
                            : (listPos.find(
                                ({ value }) =>
                                  Number(value) === Number(option?.value)
                              ) as PropsValue<any>)
                        }
                        noOptionsMessage={() =>
                          "Probablemente el establecimiento no cuenta con POS disponibles."
                        }
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
                        isOptionDisabled={(option) => Boolean(option.disabled)}
                        placeholder="Seleccione documento"
                        error={!!errors.documento || isErrorDocumentos}
                        helperText={
                          errors.documento?.value?.message ??
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
                    className="flex items-center justify-center h-[20px] hover:bg-bgDefault text-center w-1/3"
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
            <span className="text-danger">
              {errorSeries.response.data.message}
            </span>
          )}
          {isLoadingSeries ? (
            <LoadingTotal />
          ) : (
            fields.map((posItem, posIndex) => (
              <div key={posItem.pos.id} className="mt-5 border-t py-2">
                {/* Renderizar el POS una sola vez */}
                <div className="w-full text-center font-bold py-2">
                  {posItem.pos.nombre}
                </div>

                {/* Renderizar los documentos dentro del POS */}
                {posItem.documentos.map((docItem: any, docIndex: number) => (
                  <div
                    key={docItem.id}
                    className={`flex ${docIndex === 0 ? "py-2" : "pt-2"} gap-5 border-b`}
                  >
                    <div className="w-1/3 text-center flex justify-center items-center">
                      Tipo: {String(docItem.nombre).toUpperCase()}
                    </div>

                    {/* Renderizar las series dentro del documento */}
                    <div className="w-2/3 flex flex-col justify-center items-center gap-1">
                      {docItem.series?.map((ser: any, serieIndex: number) => (
                        <div key={serieIndex} className="w-full flex gap-2">
                          <div className="w-2/3 flex flex-col justify-center items-center">
                            Serie: {ser.serie}
                          </div>
                          {ser.new && (
                            <button
                              onClick={() =>
                                removeSerie(posIndex, docIndex, ser.serie)
                              }
                              className="w-1/3 text-center border border-danger text-danger h-[30px]"
                              type="button"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </Box>
      </DialogContentBeta>
      <DialogActionsBeta>
        <Button
          size="small"
          className="text-default"
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

export default SeriesCreate;
