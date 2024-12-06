import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import {
  IOption,
  SelectSimple,
} from "../../../../components/common/Selects/SelectSimple";
import { DialogContent, Grid } from "@mui/material";
import InputText from "../../../../components/Material/Input/InputText";
import { DialogActionsBeta } from "../../../../components/common/Dialogs/_DialogActions";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
  UseFormGetValues,
  UseFormSetError,
  FieldErrors,
  UseFormTrigger,
} from "react-hook-form";
import { useTipoIgv } from "../../../TiposIgvs/hooks/useTipoIgvs";
import { SelectMiddle } from "../../../../components/common/Selects/SelectMiddle";
import { useUnidad } from "../../../TiposUnidadMedida/hooks/useUnidad";
import { useCallback, useEffect, useState } from "react";
import { SingleValue } from "react-select";
import ToolTipIconButton from "../../../../components/Material/Tooltip/IconButton";
import { fixed, round } from "../../../../utils/functions.utils";
import { IInvoice } from "../../../../interfaces/models/invoices/invoice.interface";

interface Props {
  open: boolean;
  handleClose: () => void;
  control: Control<IInvoice, any>;
  agregarProducto: () => void;
  setValue: UseFormSetValue<IInvoice>;
  watch: UseFormWatch<IInvoice>;
  getValues: UseFormGetValues<any>;
  actualizarProducto: (posicionTabla: number) => void;
  errors: FieldErrors<IInvoice>;
  setError: UseFormSetError<IInvoice>;
  trigger: UseFormTrigger<IInvoice>;
}

const ModalProductos = ({
  open,
  handleClose,
  control,
  agregarProducto,
  actualizarProducto,
  setValue,
  watch,
  getValues,
  errors,
  setError,
  trigger,
}: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const DECIMAL = 6;
  const TIPO_OPERACION = String(watch("producto.tipAfeIgv"));

  const { data: dataTipoIgvs, isLoading: isLoadingTipoIgvs } = useTipoIgv();
  const { data: dataUnidades, isLoading: isLoadingUnidades } = useUnidad();

  const [tipOperacion, setTipOperacion] = useState("");
  const [igvUnitario, setIgvUnitario] = useState(`0.${"0".repeat(DECIMAL)}`);
  const [mtoPrecioUnitario, setMtoPrecioUnitario] = useState("");
  const [errorPrecioUnitario, setErrorPrecioUnitario] = useState("");

  const tiposIgvs =
    dataTipoIgvs?.map((item) => {
      return {
        label: item.tipo_igv,
        value: item.codigo,
      };
    }) || [];

  const unidades =
    dataUnidades?.map((item) => {
      return {
        label: item.unidad,
        value: item.codigo,
      };
    }) || [];

  const tiposIgvsGroups = dataTipoIgvs?.reduce((acumulador: any[], item) => {
    const categoria = acumulador.find(
      (element: any) => element.label === item.categoria
    );

    if (!categoria) {
      acumulador.push({
        label: item.categoria,
        options: [
          {
            label: item.codigo + " - " + item.tipo_igv,
            value: item.codigo,
          },
        ],
      });
    } else {
      categoria.options.push({
        label: item.codigo + " - " + item.tipo_igv,
        value: item.codigo,
      });
    }

    return acumulador;
  }, []);

  const setTipoOperacion = useCallback(
    (tipOpe = TIPO_OPERACION) => {
      if (tipOpe === "10") {
        setTipOperacion("Ope. Gravada");
      } else if (tipOpe === "20") {
        setIgvUnitario("Ope. Exonerada");
        setTipOperacion("Ope. Exonerada");
      } else if (tipOpe === "30") {
        setIgvUnitario("Ope. Inafecta");
        setTipOperacion("Ope. Inafecta");
      } else if (tipOpe === "40") {
        setIgvUnitario("Exportación");
        setTipOperacion("Exportación");
      } else {
        setTipOperacion("Ope. Gratuita");
        if (["21", "31", "32", "33", "34", "35", "36", "37"].includes(tipOpe)) {
          setIgvUnitario("Ope. Gratuita");
        }
      }
    },
    [TIPO_OPERACION]
  );

  //ope grava 10-18%
  //ope gratuitas ["11", "12","13","14","15","16","17"]-18%
  const porcentaje18 = ["10", "11", "12", "13", "14", "15", "16", "17"];

  //inafecto one  30-0%
  //exonerada one 20-0%
  //exportacion 40-0%
  //exonerada transferencia gratuita  21-0%
  //inafectos gratuitas ["31","32","33","34","35","36","37"]-0%
  const porcentaje0 = [
    "20",
    "30",
    "40",
    "21",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
  ];

  useEffect(() => {
    setTipoOperacion();
  }, [setTipoOperacion]);

  //console.log(watch("producto"));

  const calculaOperaciones = useCallback(
    (tipAfeIgvAux?: string, porcentajeAux?: number) => {
      const porcentaje = porcentajeAux
        ? porcentajeAux
        : Number(getValues("producto.porcentajeIgv"));
      const valorUnitario = Number(getValues("producto.mtoValorUnitario"));
      const tipAfeIgv = tipAfeIgvAux
        ? tipAfeIgvAux
        : String(getValues("producto.tipAfeIgv"));

      setValue("producto.mtoValorUnitario", fixed(valorUnitario, DECIMAL));
      //gravada
      if (tipAfeIgv === "10") {
        const igvUnitario = (valorUnitario * porcentaje) / 100;
        setIgvUnitario(fixed(round(igvUnitario, DECIMAL), DECIMAL));

        const mtoPrecioUnitario = valorUnitario + igvUnitario;
        setMtoPrecioUnitario(fixed(mtoPrecioUnitario, DECIMAL));
      }
      //exonerada
      if (tipAfeIgv === "20") {
        setIgvUnitario("Ope. Exonerada");
        setMtoPrecioUnitario(
          fixed(round(Number(valorUnitario), DECIMAL), DECIMAL)
        );
      }
      //inafecta
      if (tipAfeIgv === "30") {
        setIgvUnitario("Ope. Inafecta");
        setMtoPrecioUnitario(
          fixed(round(Number(valorUnitario), DECIMAL), DECIMAL)
        );
      }
      //exportacion
      if (tipAfeIgv === "40") {
        setIgvUnitario("Exportación");
        setMtoPrecioUnitario(
          fixed(round(Number(valorUnitario), DECIMAL), DECIMAL)
        );
      }
      //gravadas gratuitas
      if (
        ["11", "12", "13", "14", "15", "16", "17"].includes(String(tipAfeIgv))
      ) {
        const igvUnitario = (valorUnitario * porcentaje) / 100;
        setIgvUnitario(fixed(round(igvUnitario, DECIMAL), DECIMAL));

        const mtoPrecioUnitario = valorUnitario + igvUnitario;
        setMtoPrecioUnitario(fixed(mtoPrecioUnitario, DECIMAL));
      }
      //inafectas gratuitas
      if (
        ["21", "31", "32", "33", "34", "35", "36", "37"].includes(
          String(tipAfeIgv)
        )
      ) {
        setIgvUnitario("Ope. Gratuita");
        setMtoPrecioUnitario(
          fixed(round(Number(valorUnitario), DECIMAL), DECIMAL)
        );
      }
    },
    [getValues, setValue]
  );

  useEffect(() => {
    if (getValues("producto.uuid")) {
      calculaOperaciones();
    }
  }, [getValues, calculaOperaciones]);

  const inputDisabled = porcentaje0.includes(
    String(getValues("producto.tipAfeIgv"))
  );

  console.log(watch("producto"));
  console.log(errors);
  console.log(mtoPrecioUnitario);

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      aria-labelledby="responsive-dialog-title"
      fullWidth
    >
      <DialogContent>
        <Divider>
          <Controller
            control={control}
            name="producto.tipAfeIgv"
            render={({ field }) => {
              return (
                <SelectMiddle
                  {...field}
                  className="tipo_igv-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  placeholder="Tipo de IGV"
                  isLoading={isLoadingTipoIgvs}
                  options={tiposIgvsGroups}
                  //isClearable
                  value={tiposIgvs.find(
                    ({ value }) => String(value) === String(field.value)
                  )}
                  onChange={(e) => {
                    const tipAfeIgv = String(
                      (e as SingleValue<IOption>)?.value
                    );
                    field.onChange(tipAfeIgv);

                    setTipoOperacion(tipAfeIgv);

                    //ope grava 10-18%
                    //ope gratuitas ["11", "12","13","14","15","16","17"]-18%
                    if (porcentaje18.includes(tipAfeIgv)) {
                      setValue("producto.porcentajeIgv", 18);
                    }

                    //inafecto one  30-0%
                    //exonerada one 20-0%
                    //exportacion 40-0%
                    //exonerada transferencia gratuita  21-0%
                    //inafectos gratuitas ["31","32","33","34","35","36","37"]-0%
                    if (porcentaje0.includes(tipAfeIgv)) {
                      setValue("producto.porcentajeIgv", 0);
                    }

                    calculaOperaciones(tipAfeIgv, 18);
                  }}
                />
              );
            }}
          />
        </Divider>
        <Grid container direction="column" marginTop={3}>
          <Grid item container spacing={1}>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="producto.cantidad"
                render={({ field }) => (
                  <InputText
                    {...field}
                    variant="filled"
                    type="number"
                    value={field.value === 0 ? "" : field.value}
                    error={Boolean(errors.producto?.cantidad)}
                    onBlur={(e) => {
                      e.target.value = Number(e.target.value).toFixed();
                    }}
                    onChange={(e) => {
                      if (!/^-?\d*\.?\d{0,10}$/.test(e.target.value)) {
                        setError("producto.cantidad", {
                          type: "pattern",
                          message: "Cantidad inválida",
                        });
                        return;
                      }

                      const value = Number(e.target.value);

                      if (value < 1) {
                        field.onChange(Number(0.000001));
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                  />
                )}
              />
              {errors.producto?.cantidad?.message}
            </Grid>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="producto.unidad"
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    className="unidad_medida-single"
                    classNamePrefix="select"
                    placeholder="Unidad de medida"
                    isSearchable={true}
                    isLoading={isLoadingUnidades}
                    options={unidades}
                    //isClearable
                    value={unidades.find(
                      ({ value }) => String(value) === String(field.value)
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="producto.codigo"
                render={({ field }) => (
                  <InputText
                    {...field}
                    variant="filled"
                    type="text"
                    placeholder="código (opcional)"
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid item container>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="producto.descripcion"
                render={({ field }) => (
                  <InputText
                    {...field}
                    variant="filled"
                    type="text"
                    placeholder="descripción detallada"
                    error={!!errors.producto?.descripcion}
                    helperText={errors.producto?.descripcion?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
          {/* VALOR UNITARIO */}
          <Grid item container justifyContent={"end"}>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="producto.mtoValorUnitario"
                render={({ field }) => {
                  return (
                    <>
                      <InputText
                        {...field}
                        autoComplete="off"
                        variant="filled"
                        type="number"
                        placeholder="valor unitario"
                        error={!!errors.producto?.mtoValorUnitario}
                        helperText={errors.producto?.mtoValorUnitario?.message}
                        value={field.value === "" ? "" : field.value}
                        inputProps={{
                          step: Math.pow(10, -DECIMAL),
                          min: `0.${"0".repeat(DECIMAL)}`,
                        }}
                        onBlur={(e) => {
                          if (!e.target.value) {
                            setValue("producto.mtoValorUnitario", "");
                            //setMtoPrecioUnitario("");
                            setIgvUnitario(`0.${"0".repeat(DECIMAL)}`);
                            return;
                          }
                          field.onChange(
                            fixed(Number(e.target.value), DECIMAL)
                          );
                        }}
                        onChange={(e) => {
                          if (!e.target.value) {
                            setValue("producto.mtoValorUnitario", "", {
                              shouldValidate: true,
                            });
                            setMtoPrecioUnitario(fixed(0, DECIMAL));
                            setIgvUnitario(`0.${"0".repeat(DECIMAL)}`);
                            return;
                          }

                          setErrorPrecioUnitario("");

                          const tipoAfecIgv = String(
                            getValues("producto.tipAfeIgv")
                          );

                          const value = e.target.value;
                          field.onChange(value);

                          const mtoValorUnitario = round(
                            Number(value),
                            DECIMAL
                          );
                          const porcentaje = Number(
                            getValues("producto.porcentajeIgv")
                          );

                          //Set value igv unitario
                          const igvUnitario =
                            (mtoValorUnitario * porcentaje) / 100;
                          setIgvUnitario(
                            fixed(round(igvUnitario, DECIMAL), DECIMAL)
                          );
                          setTipoOperacion(tipoAfecIgv);

                          //Set value Precio unitario
                          const mtoPrecioUnitario =
                            mtoValorUnitario + igvUnitario;
                          setMtoPrecioUnitario(
                            fixed(mtoPrecioUnitario, DECIMAL)
                          );
                        }}
                      />
                    </>
                  );
                }}
              />
            </Grid>
          </Grid>
          {/* IGV */}
          <Grid item container justifyContent={"end"}>
            <Grid item xs={6} display={"flex"}>
              <div className="w-auto">
                <Controller
                  control={control}
                  name="producto.porcentajeIgv"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="border h-full p-[4px_8px] rounded-tl-[4px] rounded-bl-[4px] outline-none"
                    >
                      {field.value === 18 && (
                        <option value={18}>IGV 18%</option>
                      )}
                      {field.value === 0 && <option value={0}>IGV 0%</option>}
                    </select>
                  )}
                />
              </div>
              <div className="flex flex-1">
                <input
                  className="text-right flex-1 border-r border-t border-b p-[4px_8px] rounded-tr-[4px] rounded-br-[4px] outline-none cursor-not-allowed text-textDisabled text-shadow-disabled"
                  disabled
                  type="text"
                  name="igvUnitario"
                  value={igvUnitario}
                />
              </div>
            </Grid>
          </Grid>
          {/* PRECIO UNITARIO INCLUYE IGV*/}
          <Grid item container justifyContent={"end"}>
            <Grid item xs={5}>
              <input
                autoComplete="off"
                type="number"
                placeholder="precio unitario (incluye IGV)"
                value={mtoPrecioUnitario}
                name="mtoPrecioUnitario"
                className={`text-left flex-1 ${errorPrecioUnitario ? "border border-[#d32f2f]" : "border"} p-[4px_8px] rounded-[4px] outline-none w-full ${
                  inputDisabled
                    ? "cursor-not-allowed text-textDisabled text-shadow-disabled"
                    : "bg-[#FAFAFA]"
                }`}
                disabled={inputDisabled}
                step={Math.pow(10, -DECIMAL)}
                min={`0.${"0".repeat(DECIMAL)}`}
                onBlur={(e) => {
                  if (!e.target.value) {
                    //setValue("producto.mtoValorUnitario", "");
                    setMtoPrecioUnitario("");
                    setIgvUnitario(`0.${"0".repeat(DECIMAL)}`);
                    return;
                  }
                  const value = fixed(Number(e.target.value), DECIMAL);
                  setMtoPrecioUnitario(value);
                }}
                onChange={(e) => {
                  if (!e.target.value) {
                    setValue("producto.mtoValorUnitario", fixed(0, DECIMAL));
                    setMtoPrecioUnitario("");
                    setIgvUnitario(`0.${"0".repeat(DECIMAL)}`);
                    setErrorPrecioUnitario("Campo obligatorio");
                    return;
                  }

                  setErrorPrecioUnitario("");

                  const value = e.target.value;
                  setMtoPrecioUnitario(value);

                  const mtoPrecioUnitario = round(Number(value), DECIMAL);
                  const porcentaje = Number(
                    getValues("producto.porcentajeIgv")
                  );

                  //Set valor unitario
                  const mtoValorUnitario =
                    mtoPrecioUnitario / (1 + porcentaje / 100);
                  setValue(
                    "producto.mtoValorUnitario",
                    fixed(round(mtoValorUnitario, DECIMAL), DECIMAL),
                    { shouldValidate: true }
                  );

                  //Set igv unitario
                  const igvUnitario = mtoPrecioUnitario - mtoValorUnitario;
                  setIgvUnitario(fixed(igvUnitario, DECIMAL));
                }}
              />
              {errorPrecioUnitario && (
                <p className="text-[#d32f2f] text-[0.75rem]">
                  {errorPrecioUnitario}
                </p>
              )}
            </Grid>
            <Grid
              item
              xs={1}
              justifyContent={"center"}
              alignItems={"center"}
              display={"flex"}
            >
              <ToolTipIconButton
                title={
                  <span className="text-default">
                    Para los cálculos se usa el valor y no el precio (esta
                    casilla es solo una referencia)
                  </span>
                }
              >
                <HelpOutlineIcon />
              </ToolTipIconButton>
            </Grid>
          </Grid>
          <Divider textAlign="left">Totales</Divider>
          {/* OPERACIONES */}
          <Grid item container>
            <Grid item xs={6} display="flex" justifyContent={"end"}>
              <label
                className={`px-4 ${
                  TIPO_OPERACION != "10" ? "text-danger" : ""
                }`}
              >
                {tipOperacion}
              </label>
            </Grid>
            <Grid item xs={6}>
              <input
                className="text-right flex-1 border p-[4px_8px] rounded-[4px] outline-none w-full cursor-not-allowed text-textDisabled text-shadow-disabled"
                placeholder="0.00"
                disabled
                type="text"
                value={fixed(
                  round(
                    Number(watch("producto.mtoValorUnitario")) *
                      Number(watch("producto.cantidad"))
                  )
                )} //Siempre se calcula del mtoValorUnitario * cantidad
              />
            </Grid>
          </Grid>
          <Grid item container>
            <Grid item xs={6} display="flex" justifyContent={"end"}>
              <label className="px-4">IGV</label>
            </Grid>
            <Grid item xs={6}>
              <input
                className="text-right flex-1 border p-[4px_8px] rounded-[4px] outline-none w-full cursor-not-allowed text-textDisabled text-shadow-disabled"
                placeholder="0.00"
                disabled
                type="text"
                value={
                  porcentaje18.includes(watch("producto.tipAfeIgv")) //Si el tipAfeIgv es 18% (gravada y gravada gratuita)
                    ? fixed(
                        round(
                          Number(igvUnitario) *
                            Number(watch("producto.cantidad"))
                        )
                      )
                    : fixed(0) //Si son 0%
                }
              />
            </Grid>
          </Grid>
          <Grid item container>
            <Grid item xs={6} display="flex" justifyContent={"end"}>
              <label className="px-4">
                <strong>Importe Total</strong>
              </label>
            </Grid>
            <Grid item xs={6}>
              <input
                className="font-bold text-right flex-1 border p-[4px_8px] rounded-[4px] outline-none w-full cursor-not-allowed text-textDisabled text-shadow-disabled"
                placeholder="0.00"
                disabled
                type="text"
                value={
                  watch("producto.tipAfeIgv") === "10" //Si es gravada onerosa
                    ? fixed(
                        round(
                          Number(watch("producto.mtoValorUnitario")) *
                            Number(watch("producto.cantidad"))
                        ) +
                          round(
                            Number(igvUnitario) *
                              Number(watch("producto.cantidad"))
                          )
                      )
                    : ["20", "30", "40"].includes(watch("producto.tipAfeIgv")) //Si es exonerada, inafecta, exportacion oneraosa
                      ? fixed(
                          round(
                            Number(watch("producto.mtoValorUnitario")) *
                              (isNaN(watch("producto.cantidad"))
                                ? 1
                                : Number(watch("producto.cantidad")))
                          )
                        )
                      : fixed(0) //Si es gratuitas
                }
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActionsBeta sx={{ justifyContent: "space-between" }}>
        <Button
          size="small"
          className="text-default"
          variant="text"
          color="secondary"
          onClick={handleClose}
        >
          Cancelar
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={async () => {
            const validModal = await trigger("producto");
            if (validModal && Boolean(mtoPrecioUnitario)) {
              return getValues("producto.uuid")
                ? actualizarProducto(getValues("producto.posicionTabla"))
                : agregarProducto();
            } else {
              setErrorPrecioUnitario("Campo obligatorio");
            }
          }}
        >
          {getValues("producto.uuid") ? "Guardar" : "Agregar"}
        </Button>
      </DialogActionsBeta>
    </Dialog>
  );
};

export default ModalProductos;
