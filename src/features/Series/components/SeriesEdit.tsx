import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Grid, IconButton } from "@mui/material";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import {
  SubmitHandler,
  useForm,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  IOption,
  SelectSimple,
} from "../../../components/common/Selects/SelectSimple";
import {
  useDocumentosByEmpresa,
  usePosByEstablishment,
} from "../../Empresa/hooks/useEmpresa";
import {
  useDisableSerie,
  useEnableSerie,
  usePostSerie,
  useSerie,
} from "../hooks/useSeries";
import { PropsValue, SingleValue } from "react-select";
import InputText from "../../../components/Material/Input/InputText";
import LoadingTotal from "../../../components/common/Loadings/LoadingTotal";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import { toast } from "sonner";
import { isError } from "../../../utils/functions.utils";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import { ISeries } from "../../../interfaces/models/series/series.interface";
import { schemaFormSeries } from "../validations/serie.schema";

interface Props {
  state: {
    visible: boolean;
    row: ISeries;
  };
  closeEdit: () => void;
}

const SeriesEdit = ({ state, closeEdit }: Props) => {
  const closeModal = () => {
    closeEdit();
  };

  const {
    data: dataSeries,
    isLoading: isLoadingSeries,
    error: errorSeries,
    isError: isErrorSeries,
  } = useSerie(Number(state.row.id));

  const methods = useForm<ISeries>({
    values: {
      empresa: Number(state.row.id),
      establecimiento: 0,
      documento: {
        value: "",
        label: "",
      },
      pos: {
        value: "",
        label: "",
      },
      serie: "",
      items: [],
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

  const watch = useWatch({
    control,
  });

  const {
    data: dataDocumentos,
    isLoading: isLoadingDocumentos,
    error: errorDocumentos,
    isError: isErrorDocumentos,
  } = useDocumentosByEmpresa(Number(state.row.id));

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

  const listEstablecimientos =
    dataSeries?.establecimientos?.map((item) => {
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

  const { mutateAsync: mutateSerieAsync, isPending: isLoadingSerie } =
    usePostSerie();

  const { mutateAsync: mutateDisable } = useDisableSerie();

  const { mutateAsync: mutateEnable } = useEnableSerie();

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

    try {
      const res = await mutateSerieAsync({
        empresa,
        establecimiento,
        pos: sendDataItems,
      });
      toast.success(res.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

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

  const activar = async (
    posIndex: number,
    docIndex: number,
    serieId: number
  ) => {
    try {
      await mutateEnable({ id: serieId });

      // Deshabilitar la serie en la estructura de datos
      return update(posIndex, {
        ...fields[posIndex],
        documentos: fields[posIndex]?.documentos.map((doc: any, i: number) =>
          i === docIndex
            ? {
                ...doc,
                series: doc.series.map((s: any) =>
                  s.id === serieId ? { ...s, estado: true } : s
                ),
              }
            : doc
        ),
      });
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response?.data?.message || "Ocurrió un error inesperado");
      }
    }
  };

  const desactivar = async (
    posIndex: number,
    docIndex: number,
    serieId: number
  ) => {
    try {
      await mutateDisable({ id: serieId });

      // Deshabilitar la serie en la estructura de datos
      return update(posIndex, {
        ...fields[posIndex],
        documentos: fields[posIndex]?.documentos.map((doc: any, i: number) =>
          i === docIndex
            ? {
                ...doc,
                series: doc.series.map((s: any) =>
                  s.id === serieId ? { ...s, estado: false } : s
                ),
              }
            : doc
        ),
      });
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response?.data?.message || "Ocurrió un error inesperado");
      }
    }
  };

  return (
    <DialogBeta open={state.visible}>
      <DialogTitleBeta>Editar {state.row.empresa}</DialogTitleBeta>
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
                  {state.row.empresa}
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
                        isOptionDisabled={(option) => Boolean(option.disabled)}
                        placeholder="Seleccione establecimiento"
                        error={!!errors.establecimiento || isErrorSeries}
                        helperText={
                          errors.establecimiento?.message ??
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
                        placeholder="Seleccione documento"
                        error={!!errors.documento || isErrorDocumentos}
                        isOptionDisabled={(option) => Boolean(option.disabled)}
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
                          <div className="flex flex-1 text-center justify-center">
                            {ser.estado ? (
                              <CheckIcon
                                onClick={() =>
                                  desactivar(posIndex, docIndex, Number(ser.id))
                                }
                                className="w-full h-8 text-green-700 cursor-pointer"
                              />
                            ) : ser.new ? (
                              <button
                                onClick={() =>
                                  removeSerie(posIndex, docIndex, ser.serie)
                                }
                                className="w-full text-center border border-danger text-danger h-[30px]"
                                type="button"
                              >
                                Eliminar
                              </button>
                            ) : (
                              <RemoveIcon
                                onClick={() =>
                                  activar(posIndex, docIndex, Number(ser.id))
                                }
                                className="w-full h-8 text-danger cursor-pointer"
                              />
                            )}
                          </div>
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
