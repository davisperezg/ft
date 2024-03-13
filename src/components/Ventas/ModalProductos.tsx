import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import { SelectSimple } from "../Select/SelectSimple";
import { DialogContent, Grid, IconButton, Tooltip } from "@mui/material";
import InputText from "../Material/Input/InputText";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
  UseFormGetValues,
  UseFormUnregister,
} from "react-hook-form";
import { decimalesSimples } from "../../utils/letras_numeros";
import { IInvoice } from "../../interface/invoice.interface";
import { useTipoIgv } from "../../hooks/useTipoIgvs";
import { SelectMiddle } from "../Select/SelectMiddle";
import { useUnidad } from "../../hooks/useUnidad";
import { useState } from "react";

interface Props {
  open: boolean;
  handleClose: () => void;
  control: Control<IInvoice, any>;
  agregarProducto: () => void;
  setValue: UseFormSetValue<IInvoice>;
  watch: UseFormWatch<IInvoice>;
  getValues: UseFormGetValues<any>;
  actualizarProducto: (posicionTabla: number) => void;
  unregister: UseFormUnregister<IInvoice>;
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
  unregister,
}: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { data: dataTipoIgvs, isLoading: isLoadingTipoIgvs } = useTipoIgv();
  const { data: dataUnidades, isLoading: isLoadingUnidades } = useUnidad();
  const [operacion, setOperacion] = useState("GRAVADA_ONEROSA");

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
            label: item.tipo_igv,
            value: item.codigo,
          },
        ],
      });
    } else {
      categoria.options.push({
        label: item.tipo_igv,
        value: item.codigo,
      });
    }

    return acumulador;
  }, []);

  const convertDecimal = (importe: number, decimal: number) => {
    return Number(importe).toFixed(decimal);
  };

  const tipoIgv = watch("producto.tipAfeIgv");

  const nombreOperacion = () => {
    switch (tipoIgv) {
      case "10":
        return "Ope. Gravada";
      case "20":
        return "Ope. Exonerada";
      case "30":
        return "Ope. Inafecta";
      case "40":
        return "Exportación";
      default:
        return "Ope. Gratuita";
    }
  };

  const disabledByOpe =
    tipoIgv === "20" ||
    tipoIgv === "30" ||
    tipoIgv === "40" ||
    tipoIgv === "21" ||
    tipoIgv === "31" ||
    tipoIgv === "32" ||
    tipoIgv === "33" ||
    tipoIgv === "34" ||
    tipoIgv === "35" ||
    tipoIgv === "36" ||
    tipoIgv === "37"
      ? true
      : false;

  const isGravadasGratuitas =
    tipoIgv === "11" ||
    tipoIgv === "12" ||
    tipoIgv === "13" ||
    tipoIgv === "14" ||
    tipoIgv === "15" ||
    tipoIgv === "16" ||
    tipoIgv === "17"
      ? true
      : false;

  const isInafectosGratuitos =
    tipoIgv === "21" ||
    tipoIgv === "31" ||
    tipoIgv === "32" ||
    tipoIgv === "33" ||
    tipoIgv === "34" ||
    tipoIgv === "35" ||
    tipoIgv === "36" ||
    tipoIgv === "37"
      ? true
      : false;

  //Seteamos el mtoValorUnitario obteniendo el mismo valor del mtoValorGratuito
  const valorGratuitoToValorUnitario = () => {
    const mtoValorGratuito = Number(watch("producto.mtoValorGratuito")) || 0;
    setValue("producto.mtoValorUnitario", convertDecimal(mtoValorGratuito, 3));
    setTimeout(() => {
      unregister("producto.mtoValorGratuito");
    }, 100);
  };

  const esperarSet = (
    nombreSet: string,
    valor: number,
    cantDecimal: number
  ) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setValue<any>(
          `producto.${nombreSet}`,
          convertDecimal(valor || 0, cantDecimal)
        );
        resolve(watch<any>(`producto.${nombreSet}`));
      }, 100);
    });
  };

  const calculo = async (
    tipAfectacion: string,
    cantidad = Number(watch("producto.cantidad"))
  ) => {
    let mtoValorUnitario = Number(watch("producto.mtoValorUnitario")) || 0;
    let mtoValorGratuito = Number(watch("producto.mtoValorGratuito"));

    if (
      tipAfectacion === "GRAVADA_ONEROSA" ||
      tipAfectacion === "EXPORTACION" ||
      tipAfectacion === "EXONERADA_INAFECTA_ONEROSA"
    ) {
      if (isNaN(mtoValorGratuito)) {
        setValue(
          "producto.mtoValorUnitario",
          convertDecimal(mtoValorUnitario, 3)
        );
      } else {
        valorGratuitoToValorUnitario();
        mtoValorUnitario = Number(watch("producto.mtoValorUnitario"));
      }
    }

    if (
      tipAfectacion === "GRAVADA_GRATUITA" ||
      tipAfectacion === "INAFECTA_GRATUITA"
    ) {
      if (isNaN(mtoValorGratuito)) {
        const mtoValorGratuitoAux = await esperarSet(
          "mtoValorGratuito",
          mtoValorUnitario,
          3
        );
        mtoValorGratuito = Number(mtoValorGratuitoAux);
      }
      setValue("producto.mtoValorUnitario", convertDecimal(0, 3));
    }

    const mtoValorUnitarioOrGratuito =
      tipAfectacion === "GRAVADA_ONEROSA" ||
      tipAfectacion === "EXPORTACION" ||
      tipAfectacion === "EXONERADA_INAFECTA_ONEROSA"
        ? mtoValorUnitario
        : mtoValorGratuito;

    //Set IGV unitario
    const igvUnitario =
      tipAfectacion === "INAFECTA_GRATUITA" ||
      tipAfectacion === "EXPORTACION" ||
      tipAfectacion === "EXONERADA_INAFECTA_ONEROSA"
        ? 0
        : (mtoValorUnitarioOrGratuito * 18) / 100;
    setValue("producto.igvUnitario", convertDecimal(igvUnitario, 2));

    //Set Valor precio unitario. Si es gravada es con igv y preciounitario, si es gratuita el precio unitario sera 0
    const mtoPrecioUnitario =
      tipAfectacion === "GRAVADA_ONEROSA" ||
      tipAfectacion === "EXPORTACION" ||
      tipAfectacion === "EXONERADA_INAFECTA_ONEROSA"
        ? mtoValorUnitarioOrGratuito + igvUnitario
        : 0;
    setValue(
      "producto.mtoPrecioUnitario",
      convertDecimal(mtoPrecioUnitario, 3)
    );

    //Calculo para gravadas gratuitas mtoPrecioUnitarioGratuito
    if (tipAfectacion === "GRAVADA_GRATUITA") {
      const mtoPrecioUnitarioGratuito =
        mtoValorUnitarioOrGratuito + igvUnitario;

      setValue(
        "producto.mtoPrecioUnitarioGratuito",
        convertDecimal(mtoPrecioUnitarioGratuito, 3)
      );
    }

    //Set baseIgv y mtoValorVenta
    //const cantidad = ;
    const mtoBaseIgv = Number(mtoValorUnitarioOrGratuito) * cantidad;
    const mtoValorVenta = Number(mtoValorUnitarioOrGratuito) * cantidad;
    setValue("producto.mtoBaseIgv", convertDecimal(mtoBaseIgv, 2));
    setValue("producto.mtoValorVenta", convertDecimal(mtoValorVenta, 2));

    //Set igv
    const igv =
      tipAfectacion === "INAFECTA_GRATUITA" ||
      tipAfectacion === "EXPORTACION" ||
      tipAfectacion === "EXONERADA_INAFECTA_ONEROSA"
        ? 0
        : Number(igvUnitario) * cantidad;
    setValue("producto.igv", convertDecimal(igv, 2));

    //Set total impuestos
    const totalImpuestos =
      tipAfectacion === "INAFECTA_GRATUITA" ||
      tipAfectacion === "EXPORTACION" ||
      tipAfectacion === "EXONERADA_INAFECTA_ONEROSA"
        ? 0
        : igv + 0;
    setValue("producto.totalImpuestos", convertDecimal(totalImpuestos, 2));

    //Set total item
    const mtoTotalItem =
      tipAfectacion === "GRAVADA_ONEROSA" ||
      tipAfectacion === "EXPORTACION" ||
      tipAfectacion === "EXONERADA_INAFECTA_ONEROSA"
        ? mtoValorVenta + totalImpuestos
        : 0;
    setValue("producto.mtoTotalItem", convertDecimal(mtoTotalItem, 2));
  };

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
                  onChange={(e: any) => {
                    const tipoAfeIgv = e.value;
                    field.onChange(tipoAfeIgv);

                    //Las ope gravadas y gravadas gratuitas tendran el igv 18%
                    if (
                      tipoAfeIgv === "10" ||
                      tipoAfeIgv === "11" ||
                      tipoAfeIgv === "12" ||
                      tipoAfeIgv === "13" ||
                      tipoAfeIgv === "14" ||
                      tipoAfeIgv === "15" ||
                      tipoAfeIgv === "16" ||
                      tipoAfeIgv === "17"
                    ) {
                      setValue("producto.porcentajeIgv", 18);

                      //La ope gravada tendra el igv 18% con monto total
                      if (tipoAfeIgv === "10") {
                        unregister("producto.mtoPrecioUnitarioGratuito");
                        setOperacion("GRAVADA_ONEROSA");
                        calculo("GRAVADA_ONEROSA");
                      }

                      //Las gravadas gratuitas tendra igv 18% pero con importe total monto 0
                      if (
                        tipoAfeIgv === "11" ||
                        tipoAfeIgv === "12" ||
                        tipoAfeIgv === "13" ||
                        tipoAfeIgv === "14" ||
                        tipoAfeIgv === "15" ||
                        tipoAfeIgv === "16" ||
                        tipoAfeIgv === "17"
                      ) {
                        setOperacion("GRAVADA_GRATUITA");
                        calculo("GRAVADA_GRATUITA");
                      }
                    }

                    //Las gratuitas inafectas, ope exonerada, exonerada gratuita, ope inafecta y exportacion seran 0% de igv
                    if (
                      tipoAfeIgv === "20" ||
                      tipoAfeIgv === "21" ||
                      tipoAfeIgv === "30" ||
                      tipoAfeIgv === "31" ||
                      tipoAfeIgv === "32" ||
                      tipoAfeIgv === "33" ||
                      tipoAfeIgv === "34" ||
                      tipoAfeIgv === "35" ||
                      tipoAfeIgv === "36" ||
                      tipoAfeIgv === "37" ||
                      tipoAfeIgv === "40"
                    ) {
                      setValue("producto.porcentajeIgv", 0);
                      unregister("producto.mtoPrecioUnitarioGratuito");

                      //ope exonerada(20) con igv 0% y ope inafecta(30) con igv 0%
                      if (tipoAfeIgv === "20" || tipoAfeIgv === "30") {
                        setOperacion("EXONERADA_INAFECTA_ONEROSA");
                        calculo("EXONERADA_INAFECTA_ONEROSA");
                      }

                      //inafectas gratutitas (31-37), exonerado gratuita(21)
                      if (
                        tipoAfeIgv === "31" ||
                        tipoAfeIgv === "32" ||
                        tipoAfeIgv === "33" ||
                        tipoAfeIgv === "34" ||
                        tipoAfeIgv === "35" ||
                        tipoAfeIgv === "36" ||
                        tipoAfeIgv === "37" ||
                        tipoAfeIgv === "21"
                      ) {
                        setOperacion("INAFECTA_GRATUITA");
                        calculo("INAFECTA_GRATUITA");
                      }

                      //Exportación bienes y servicios (40)
                      if (tipoAfeIgv === "40") {
                        // Codigo Producto Sunat, requerido - Cliente: extranjeria o sin documentos.
                        setOperacion("EXPORTACION");
                        calculo("EXPORTACION");
                      }
                    }
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
                    onChange={(e) => {
                      const cantidad = Number(e.target.value);
                      if (cantidad < 1) return;

                      field.onChange(cantidad);

                      calculo(operacion, cantidad);
                    }}
                  />
                )}
              />
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
                    onChange={(e: any) => {
                      field.onChange(e.value);
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
                  />
                )}
              />
            </Grid>
          </Grid>
          {/* VALOR UNITARIO */}
          <Grid item container justifyContent={"end"}>
            <Grid item xs={6}>
              {isGravadasGratuitas || isInafectosGratuitos ? (
                <>
                  <Controller
                    control={control}
                    name="producto.mtoValorGratuito"
                    render={({ field }) => {
                      return (
                        <InputText
                          {...field}
                          autoComplete="off"
                          variant="filled"
                          type="number"
                          placeholder="valor unitario"
                          inputProps={{
                            step: 0.001,
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            const formattedValue = parseFloat(value).toFixed(3);
                            setValue(
                              "producto.mtoValorGratuito",
                              formattedValue
                            );
                          }}
                          onChange={(e) => {
                            const mtoValorGratuito = e.target.value;
                            if (Number(mtoValorGratuito) < 0) return;

                            field.onChange(mtoValorGratuito);

                            calculo(
                              operacion,
                              Number(watch("producto.cantidad"))
                            );
                          }}
                        />
                      );
                    }}
                  />
                </>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="producto.mtoValorUnitario"
                    render={({ field }) => (
                      <InputText
                        {...field}
                        autoComplete="off"
                        variant="filled"
                        type="number"
                        onBlur={(e) => {
                          const value = e.target.value;
                          const formattedValue = parseFloat(value).toFixed(3);
                          setValue("producto.mtoValorUnitario", formattedValue);
                        }}
                        onChange={(e) => {
                          const mtoValorUnitario = e.target.value;
                          if (Number(mtoValorUnitario) < 0) return;

                          field.onChange(mtoValorUnitario);

                          if (!isGravadasGratuitas || !isInafectosGratuitos) {
                            const porcentajeIgv = Number(
                              watch("producto.porcentajeIgv")
                            );

                            //Set IGV unitario
                            const igvUnitario =
                              (Number(mtoValorUnitario) * porcentajeIgv) / 100;
                            setValue(
                              "producto.igvUnitario",
                              igvUnitario.toFixed(2)
                            );

                            //Set Valor precio unitario
                            const mtoPrecioUnitario =
                              Number(mtoValorUnitario) + Number(igvUnitario);
                            setValue(
                              "producto.mtoPrecioUnitario",
                              convertDecimal(mtoPrecioUnitario, 3)
                            );

                            //Set baseIgv y mtoValorVenta
                            const cantidad = Number(watch("producto.cantidad"));
                            const mtoBaseIgv =
                              Number(mtoValorUnitario) * cantidad;
                            const mtoValorVenta =
                              Number(mtoValorUnitario) * cantidad;
                            setValue(
                              "producto.mtoBaseIgv",
                              convertDecimal(mtoBaseIgv, 2)
                            );
                            setValue(
                              "producto.mtoValorVenta",
                              convertDecimal(mtoBaseIgv, 2)
                            );

                            //Set igv
                            const igv = Number(igvUnitario) * cantidad;
                            setValue("producto.igv", convertDecimal(igv, 2));

                            //Set total impuestos
                            const totalImpuestos = igv + 0;
                            setValue(
                              "producto.totalImpuestos",
                              convertDecimal(totalImpuestos, 2)
                            );

                            //Set total item
                            const mtoTotalItem = totalImpuestos + mtoValorVenta;
                            setValue(
                              "producto.mtoTotalItem",
                              convertDecimal(mtoTotalItem, 2)
                            );
                          }
                        }}
                        placeholder="valor unitario"
                        inputProps={{
                          step: 0.001,
                        }}
                      />
                    )}
                  />
                </>
              )}
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
                  placeholder="0.00"
                  disabled
                  type="text"
                  value={
                    isInafectosGratuitos
                      ? "Ope. Gratuita"
                      : tipoIgv === "40"
                      ? "Exportación"
                      : tipoIgv === "20"
                      ? "Ope. Exonerada"
                      : tipoIgv === "30"
                      ? "Ope. Inafecta"
                      : watch("producto.igvUnitario")
                  }
                />
              </div>
            </Grid>
          </Grid>
          {/* PRECIO UNITARIO INCLUYE IGV*/}
          <Grid item container justifyContent={"end"}>
            <Grid item xs={5}>
              {isGravadasGratuitas ? (
                <>
                  <Controller
                    control={control}
                    name="producto.mtoPrecioUnitarioGratuito"
                    render={({ field }) => (
                      <InputText
                        {...field}
                        autoComplete="off"
                        variant="filled"
                        type="number"
                        disabled={disabledByOpe}
                        placeholder="precio unitario (incluye IGV)"
                        inputProps={{
                          step: 0.001,
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          const formattedValue = parseFloat(value).toFixed(3);
                          setValue(
                            "producto.mtoPrecioUnitarioGratuito",
                            formattedValue
                          );
                        }}
                        value={field.value}
                        onChange={(e) => {
                          const mtoPrecioUnitarioGratuito = e.target.value;
                          if (Number(mtoPrecioUnitarioGratuito) < 0) return;

                          field.onChange(mtoPrecioUnitarioGratuito);

                          //Set Valor unitario mtoValorGratuito
                          const mtoValorGratuito =
                            Number(mtoPrecioUnitarioGratuito) /
                            (1 + Number(watch("producto.porcentajeIgv")) / 100);
                          setValue(
                            "producto.mtoValorGratuito",
                            mtoValorGratuito.toFixed(3)
                          );

                          //Set IGV Unitario
                          const igvUnitario =
                            Number(mtoPrecioUnitarioGratuito) -
                            Number(mtoValorGratuito);
                          setValue(
                            "producto.igvUnitario",
                            igvUnitario.toFixed(2)
                          );

                          //Set baseIgv y mtoValorVenta
                          const cantidad = Number(watch("producto.cantidad"));
                          const mtoBaseIgv = mtoValorGratuito * cantidad;
                          const mtoValorVenta = mtoValorGratuito * cantidad;
                          setValue(
                            "producto.mtoBaseIgv",
                            convertDecimal(mtoBaseIgv, 2)
                          );

                          setValue(
                            "producto.mtoValorVenta",
                            convertDecimal(mtoValorVenta, 2)
                          );

                          //Set igv
                          const igv = igvUnitario * cantidad;
                          setValue("producto.igv", convertDecimal(igv, 2));

                          //Set total impuestos
                          const totalImpuestos = igv + 0;
                          setValue(
                            "producto.totalImpuestos",
                            convertDecimal(totalImpuestos, 2)
                          );

                          //Set total item
                          const mtoTotalItem = 0;
                          setValue(
                            "producto.mtoTotalItem",
                            convertDecimal(mtoTotalItem, 2)
                          );
                        }}
                      />
                    )}
                  />
                </>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="producto.mtoPrecioUnitario"
                    render={({ field }) => (
                      <InputText
                        {...field}
                        autoComplete="off"
                        variant="filled"
                        type="number"
                        disabled={disabledByOpe}
                        placeholder="precio unitario (incluye IGV)"
                        inputProps={{
                          step: 0.001,
                        }}
                        value={
                          isInafectosGratuitos
                            ? convertDecimal(
                                Number(watch("producto.mtoValorGratuito")),
                                3
                              )
                            : field.value
                        }
                        onChange={(e) => {
                          const mtoPrecioUnitario = e.target.value;
                          if (Number(mtoPrecioUnitario) < 0) return;

                          field.onChange(mtoPrecioUnitario);

                          //Set Valor unitario
                          const mtoValorUnitario =
                            Number(mtoPrecioUnitario) /
                            (1 + Number(watch("producto.porcentajeIgv")) / 100);
                          setValue(
                            "producto.mtoValorUnitario",
                            mtoValorUnitario.toFixed(3)
                          );

                          //Set IGV Unitario
                          const igvUnitario =
                            Number(mtoPrecioUnitario) -
                            Number(mtoValorUnitario);
                          setValue(
                            "producto.igvUnitario",
                            igvUnitario.toFixed(2)
                          );

                          //Set baseIgv y mtoValorVenta
                          const cantidad = Number(watch("producto.cantidad"));
                          const mtoBaseIgv = mtoValorUnitario * cantidad;
                          const mtoValorVenta = mtoValorUnitario * cantidad;
                          setValue(
                            "producto.mtoBaseIgv",
                            convertDecimal(mtoBaseIgv, 2)
                          );

                          setValue(
                            "producto.mtoValorVenta",
                            convertDecimal(mtoValorVenta, 2)
                          );

                          //Set igv
                          const igv = igvUnitario * cantidad;
                          setValue("producto.igv", convertDecimal(igv, 2));

                          //Set total impuestos
                          const totalImpuestos = igv + 0;
                          setValue(
                            "producto.totalImpuestos",
                            convertDecimal(totalImpuestos, 2)
                          );

                          //Set total item
                          const mtoTotalItem = totalImpuestos + mtoValorVenta;
                          setValue(
                            "producto.mtoTotalItem",
                            convertDecimal(mtoTotalItem, 2)
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          const formattedValue = parseFloat(value).toFixed(3);
                          setValue(
                            "producto.mtoPrecioUnitario",
                            formattedValue
                          );
                        }}
                      />
                    )}
                  />
                </>
              )}
            </Grid>
            <Grid
              item
              xs={1}
              justifyContent={"center"}
              alignItems={"center"}
              display={"flex"}
            >
              <Tooltip
                title="Para los cálculos se usa el valor y no el precio (esta casilla es solo una referencia)"
                sx={{ marginTop: "-4px" }}
                placement="top"
                arrow
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -8],
                        },
                      },
                    ],
                  },
                }}
              >
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Divider textAlign="left">Totales</Divider>
          {/* OPERACIONES */}
          <Grid item container>
            <Grid item xs={6} display="flex" justifyContent={"end"}>
              <label className="px-4">{nombreOperacion()}</label>
            </Grid>
            <Grid item xs={6}>
              <input
                className="text-right flex-1 border p-[4px_8px] rounded-[4px] outline-none w-full cursor-not-allowed text-textDisabled text-shadow-disabled"
                placeholder="0.00"
                disabled
                type="text"
                value={decimalesSimples(String(watch("producto.mtoBaseIgv")))}
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
                value={decimalesSimples(
                  String(watch("producto.totalImpuestos"))
                )}
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
                value={decimalesSimples(String(watch("producto.mtoTotalItem")))}
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActionsBeta sx={{ justifyContent: "space-between" }}>
        <Button
          size="small"
          className="text-textDefault"
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
          onClick={() =>
            getValues("producto.uuid")
              ? actualizarProducto(getValues("producto.posicionTabla"))
              : agregarProducto()
          }
        >
          {getValues("producto.uuid") ? "Guardar" : "Agregar"}
        </Button>
      </DialogActionsBeta>
    </Dialog>
  );
};

export default ModalProductos;
