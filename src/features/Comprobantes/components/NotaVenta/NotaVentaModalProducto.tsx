import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import { IOption, SelectSimple } from "../../../../components/common/Selects/SelectSimple";
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
import { useUnidad } from "../../../TiposUnidadMedida/hooks/useUnidad";
import { useCallback, useEffect, useState } from "react";
import { SingleValue } from "react-select";
import ToolTipIconButton from "../../../../components/Material/Tooltip/IconButton";
import { fixed, round } from "../../../../utils/functions.utils";
import { NotaVentaFormValues } from "../../types/nota-venta.types";

const TIP_AFE_IGV = "10";
const PORCENTAJE_IGV = 18;

interface Props {
  open: boolean;
  handleClose: () => void;
  control: Control<NotaVentaFormValues, any>;
  agregarProducto: () => void;
  setValue: UseFormSetValue<NotaVentaFormValues>;
  watch: UseFormWatch<NotaVentaFormValues>;
  getValues: UseFormGetValues<any>;
  actualizarProducto: (posicionTabla: number) => void;
  errors: FieldErrors<NotaVentaFormValues>;
  setError: UseFormSetError<NotaVentaFormValues>;
  trigger: UseFormTrigger<NotaVentaFormValues>;
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

  const { data: dataUnidades, isLoading: isLoadingUnidades } = useUnidad();

  const [igvUnitario, setIgvUnitario] = useState(`0.${"0".repeat(DECIMAL)}`);
  const [mtoPrecioUnitario, setMtoPrecioUnitario] = useState("");
  const [errorPrecioUnitario, setErrorPrecioUnitario] = useState("");

  const unidades =
    dataUnidades?.map((item) => ({
      label: item.unidad,
      value: item.codigo,
    })) ?? [];

  // Garantiza que tipAfeIgv y porcentajeIgv siempre sean los valores estáticos
  useEffect(() => {
    setValue("producto.tipAfeIgv", TIP_AFE_IGV);
    setValue("producto.porcentajeIgv", PORCENTAJE_IGV);
  }, [setValue]);

  const calculaOperaciones = useCallback(
    (porcentajeAux?: number) => {
      const porcentaje = porcentajeAux ?? Number(getValues("producto.porcentajeIgv"));
      const valorUnitario = Number(getValues("producto.mtoValorUnitario"));

      setValue("producto.mtoValorUnitario", fixed(valorUnitario, DECIMAL));

      const igv = (valorUnitario * porcentaje) / 100;
      setIgvUnitario(fixed(round(igv, DECIMAL), DECIMAL));
      setMtoPrecioUnitario(fixed(valorUnitario + igv, DECIMAL));
    },
    [getValues, setValue]
  );

  useEffect(() => {
    if (getValues("producto.uuid")) {
      calculaOperaciones();
    }
  }, [getValues, calculaOperaciones]);

  return (
    <Dialog fullScreen={fullScreen} open={open} aria-labelledby="responsive-dialog-title" fullWidth>
      <DialogContent>
        <Divider>
          <span className="text-sm font-medium text-gray-600 px-2">Ope. Gravada</span>
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
                      field.onChange(value < 1 ? Number(0.000001) : Number(value));
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
                    value={unidades.find(({ value }) => String(value) === String(field.value))}
                    onChange={(e) => {
                      field.onChange(String((e as SingleValue<IOption>)?.value));
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="producto.codigo"
                render={({ field }) => (
                  <InputText {...field} variant="filled" type="text" placeholder="código (opcional)" />
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
                    autoComplete="off"
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
                render={({ field }) => (
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
                          setIgvUnitario(`0.${"0".repeat(DECIMAL)}`);
                          return;
                        }
                        field.onChange(fixed(Number(e.target.value), DECIMAL));
                      }}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setValue("producto.mtoValorUnitario", "", { shouldValidate: true });
                          setMtoPrecioUnitario(fixed(0, DECIMAL));
                          setIgvUnitario(`0.${"0".repeat(DECIMAL)}`);
                          return;
                        }

                        setErrorPrecioUnitario("");

                        const value = e.target.value;
                        field.onChange(value);

                        const mtoValorUnitario = round(Number(value), DECIMAL);
                        const porcentaje = Number(getValues("producto.porcentajeIgv"));
                        const igv = (mtoValorUnitario * porcentaje) / 100;

                        setIgvUnitario(fixed(round(igv, DECIMAL), DECIMAL));
                        setMtoPrecioUnitario(fixed(mtoValorUnitario + igv, DECIMAL));
                      }}
                    />
                  </>
                )}
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
                      <option value={PORCENTAJE_IGV}>IGV {PORCENTAJE_IGV}%</option>
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
          {/* PRECIO UNITARIO INCLUYE IGV */}
          <Grid item container justifyContent={"end"}>
            <Grid item xs={5}>
              <input
                autoComplete="off"
                type="number"
                placeholder="precio unitario (incluye IGV)"
                value={mtoPrecioUnitario}
                name="mtoPrecioUnitario"
                className="text-left flex-1 border p-[4px_8px] rounded-[4px] outline-none w-full bg-[#FAFAFA]"
                step={Math.pow(10, -DECIMAL)}
                min={`0.${"0".repeat(DECIMAL)}`}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setMtoPrecioUnitario("");
                    setIgvUnitario(`0.${"0".repeat(DECIMAL)}`);
                    return;
                  }
                  setMtoPrecioUnitario(fixed(Number(e.target.value), DECIMAL));
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

                  const precioUnitario = round(Number(value), DECIMAL);
                  const porcentaje = Number(getValues("producto.porcentajeIgv"));
                  const valorUnitario = precioUnitario / (1 + porcentaje / 100);

                  setValue("producto.mtoValorUnitario", fixed(round(valorUnitario, DECIMAL), DECIMAL), {
                    shouldValidate: true,
                  });
                  setIgvUnitario(fixed(precioUnitario - valorUnitario, DECIMAL));
                }}
              />
              {errorPrecioUnitario && <p className="text-danger text-[0.75rem]">{errorPrecioUnitario}</p>}
            </Grid>
            <Grid item xs={1} justifyContent={"center"} alignItems={"center"} display={"flex"}>
              <ToolTipIconButton
                titleTooltip={
                  <span className="text-default">
                    Para los cálculos se usa el valor y no el precio (esta casilla es solo una referencia)
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
              <label className="px-4">Ope. Gravada</label>
            </Grid>
            <Grid item xs={6}>
              <input
                className="text-right flex-1 border p-[4px_8px] rounded-[4px] outline-none w-full cursor-not-allowed text-textDisabled text-shadow-disabled"
                placeholder="0.00"
                disabled
                type="text"
                value={fixed(round(Number(watch("producto.mtoValorUnitario")) * Number(watch("producto.cantidad"))))}
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
                value={fixed(round(Number(igvUnitario) * Number(watch("producto.cantidad"))))}
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
                value={fixed(
                  round(Number(watch("producto.mtoValorUnitario")) * Number(watch("producto.cantidad"))) +
                    round(Number(igvUnitario) * Number(watch("producto.cantidad")))
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActionsBeta sx={{ justifyContent: "space-between" }}>
        <Button size="small" className="text-default" variant="text" color="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={async () => {
            const validModal = await trigger("producto");
            if (!mtoPrecioUnitario) setErrorPrecioUnitario("Campo obligatorio");
            if (validModal) {
              return getValues("producto.uuid")
                ? actualizarProducto(getValues("producto.posicionTabla"))
                : agregarProducto();
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
