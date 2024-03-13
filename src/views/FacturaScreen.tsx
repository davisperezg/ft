/* eslint-disable @typescript-eslint/no-unused-vars */
import { ModalContext } from "../context/modalContext";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import InputText from "../components/Material/Input/InputText";
import SearchIcon from "@mui/icons-material/Search";
import { SelectSimple } from "../components/Select/SelectSimple";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import AddIcon from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";
import HighlightOff from "@mui/icons-material/HighlightOff";
import Button from "@mui/material/Button";
import ButtonSimple from "../components/Material/Button/ButtonSimple";
import Alert from "@mui/material/Alert";
import {
  SubmitHandler,
  useForm,
  Controller,
  useFieldArray,
  FormProvider,
} from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import ModalObservacion from "../components/Ventas/ModalObservacion";
import ModalProductos from "../components/Ventas/ModalProductos";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import InputDate from "../components/Material/Input/InputDate";
import { decimalesSimples, numeroALetras } from "../utils/letras_numeros";
import { IProducto } from "../interface/producto.interface";
import { IInvoice } from "../interface/invoice.interface";
import { usePostInvoice } from "../hooks/useInvoices";
import { getPersona } from "../api/ext";
import { isError } from "../utils/functions";
import { toast } from "react-toastify";
import { useMonedas } from "../hooks/useMoneda";
import { useFormaPago } from "../hooks/useFormaPago";
import { useEntidadesByEmpresa } from "../hooks/useEntidades";
import { IEntidad } from "../interface/entidad.interface";
import { useSocketInvoice } from "../hooks/useSocket";
import CachedIcon from "@mui/icons-material/Cached";

const INITIAL_PRODUCTO: IProducto = {
  tipAfeIgv: "10",
  cantidad: 1,
  unidad: "NIU",
  codigo: "",
  descripcion: "",
  porcentajeIgv: 18,
  mtoValorUnitario: "",
  mtoBaseIgv: "0.00",
  igv: "0.00",
  totalImpuestos: "0.00",
  mtoTotalItem: "0.00",
  igvUnitario: "0.00",
  mtoPrecioUnitario: "",
  //precio_base: "",
  //precio_unitario: "",
};

const INITIAL_FACTURA: IInvoice = {
  serie: "",
  numero: "",
  numeroConCeros: "",
  fecha_emision: dayjs(new Date()),
  fecha_vencimiento: null,
  ruc: "",
  cliente: "",
  direccion: "",
  tipo_entidad: "6", //dni, ruc - default es 2 ya q factura solo acepta rucs
  //tipo_documento: 0, //boleta, factura(setear jalando dato del context)
  tipo_operacion: "0101",
  moneda: "PEN",
  forma_pago: "Contado",
  observacion: "",
  observaciones_invoice: [],
  productos: [],
  producto: INITIAL_PRODUCTO,
};

const FacturaScreen = () => {
  const { userGlobal, setUserGlobal } = useContext(ModalContext);
  const [isActiveModalObs, setActiveModalObs] = useState(false);
  const [isActiveModalProductos, setActiveModalProductos] = useState(false);
  const [isOpenDateEmision, setIsOpenDateEmision] = useState(false);
  const [isOpenDateVencimiento, setIsOpenDateVencimiento] = useState(false);

  const [loading, setLoading] = useState(false);

  //const [format, setFormat] = useState<string | undefined>("");
  const empresa = JSON.parse(String(sessionStorage.getItem("empresa")));

  const myDocument = empresa.establecimiento.documentos.find(
    (doc: any) => String(doc.nombre).toUpperCase() === "FACTURA"
  );

  const mySeries = useMemo(() => {
    return myDocument?.series ?? [];
  }, [myDocument]);

  const methods = useForm<IInvoice>({
    defaultValues: INITIAL_FACTURA,
    values: {
      ...INITIAL_FACTURA,
      serie: mySeries[0].serie,
      numero: mySeries[0].numero,
      numeroConCeros: mySeries[0].numeroConCeros,
    },
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    getValues,
    setValue,
    unregister,
  } = methods;

  const {
    fields: fieldsObs,
    append: appendObs,
    remove: removeObs,
  } = useFieldArray({
    control,
    name: "observaciones_invoice",
    keyName: "uuid",
  });

  const {
    fields: fieldsProducts,
    append: appendProducts,
    remove: removeProducts,
    update: updateProducts,
  } = useFieldArray({
    control,
    name: "productos",
    keyName: "uuid",
  });

  console.log(watch());

  const eliminarProducto = (posicionTabla: number) => {
    removeProducts(posicionTabla);
  };

  const agregarProducto = () => {
    appendProducts(getValues("producto") ?? INITIAL_PRODUCTO);
    handleCloseProductos();
  };

  const agregarObservacion = () => {
    appendObs({ observacion: String(getValues("observacion")) });
    handleCloseObservacion();
  };

  const actualizarProducto = (posicionTabla: number) => {
    updateProducts(posicionTabla, getValues("producto") ?? INITIAL_PRODUCTO);
    handleCloseProductos();
  };

  const obtenerSerie = (serie: string) => {
    const correlativo = mySeries.find((item: any) => item.serie === serie);
    return correlativo;
  };

  const handleCloseObservacion = () => {
    setActiveModalObs(false);
    setValue("observacion", "");
  };
  const handleCloseProductos = () => {
    setActiveModalProductos(false);
    setValue("producto", INITIAL_PRODUCTO);
  };

  //sumar todos los montos de las operaciones gravadas de los productos
  const sumarImporteTotal = () => {
    let total = 0;
    fieldsProducts.forEach((item) => {
      total += Number(item.mtoTotalItem);
    });

    return total;
  };

  const findGravadas = fieldsProducts.filter(
    (producto) => producto.tipAfeIgv === "10"
  );

  const sumarIGVTotal = () => {
    let total = 0;
    findGravadas.forEach((item) => {
      total += Number(item.totalImpuestos);
    });

    return total;
  };

  const sumarOpeGravadasTotal = () => {
    let total = 0;
    findGravadas.forEach((item) => {
      total += Number(item.mtoValorVenta);
    });

    return total;
  };

  const findExoneradas = fieldsProducts.filter(
    (producto) => producto.tipAfeIgv === "20"
  );

  const sumarExoneradasTotal = () => {
    let total = 0;
    findExoneradas.forEach((item) => {
      total += Number(item.mtoValorVenta);
    });

    return total;
  };

  const findInafectas = fieldsProducts.filter(
    (producto) => producto.tipAfeIgv === "30"
  );

  const sumarInafectasTotal = () => {
    let total = 0;
    findInafectas.forEach((item) => {
      total += Number(item.mtoValorVenta);
    });

    return total;
  };

  const findGravadasGratuitas = fieldsProducts.filter(
    (producto) =>
      producto.tipAfeIgv === "11" ||
      producto.tipAfeIgv === "12" ||
      producto.tipAfeIgv === "13" ||
      producto.tipAfeIgv === "14" ||
      producto.tipAfeIgv === "15" ||
      producto.tipAfeIgv === "16" ||
      producto.tipAfeIgv === "17" ||
      producto.tipAfeIgv === "21" ||
      producto.tipAfeIgv === "31" ||
      producto.tipAfeIgv === "32" ||
      producto.tipAfeIgv === "33" ||
      producto.tipAfeIgv === "34" ||
      producto.tipAfeIgv === "35" ||
      producto.tipAfeIgv === "36" ||
      producto.tipAfeIgv === "37"
  );

  const sumarOpeGratuitasTotal = () => {
    let total = 0;
    findGravadasGratuitas.forEach((item) => {
      total += Number(item.mtoValorVenta);
    });

    return total;
  };

  const findExportaciones = fieldsProducts.filter(
    (producto) => producto.tipAfeIgv === "40"
  );

  const sumarExportacionTotal = () => {
    let total = 0;
    findExportaciones.forEach((item) => {
      total += Number(item.mtoValorVenta);
    });

    return total;
  };

  const {
    data: dataEntidades,
    error: errorEntidades,
    isLoading: isLoadingEntidades,
  } = useEntidadesByEmpresa(Number(userGlobal.empresaActual.id));

  const [isOpenSearch, setOpenSearch] = useState(false);
  const rucSelect = useRef<HTMLDivElement>(null);
  const ruc = watch("ruc");

  const memoEntidades = useMemo(() => {
    let result = dataEntidades || [];

    if (ruc.length > 0) {
      //filtrar por ruc
      result =
        dataEntidades?.filter((item) =>
          item.numero_documento.toLowerCase().includes(ruc)
        ) || [];
    }

    return result;
  }, [dataEntidades, ruc]);

  const consultarRuc = async () => {
    setOpenSearch(false);
    try {
      const entidad = await getPersona("ruc", getValues("ruc"));
      const { departamento, provincia, distrito, direccion } = entidad;
      setValue("cliente", entidad.razonSocial);
      if (distrito) {
        setValue(
          "direccion",
          `${direccion} ${distrito} ${provincia} ${departamento}`
        );
      } else {
        setValue("direccion", `${direccion}`);
      }
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const { data: dataMonedas, isLoading: isLoadingMonedas } = useMonedas();

  const monedas =
    dataMonedas?.map((item) => {
      const abreviado =
        item.abreviado.charAt(0).toUpperCase() + item.abreviado.slice(1);
      return {
        label: `${item.abrstandar} - (${item.simbolo}) ${abreviado}`,
        value: item.abrstandar,
      };
    }) || [];

  const { data: dataFormaPagos, isLoading: isLoadingFormaPagos } =
    useFormaPago();

  const formaPagos =
    dataFormaPagos?.map((item) => {
      return {
        label: item.forma_pago,
        value: item.forma_pago,
      };
    }) || [];

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      // Verificar si el clic fue fuera del componente
      if (rucSelect.current && !rucSelect.current.contains(event.target)) {
        console.log(rucSelect.current);
        console.log(event.target);
        setOpenSearch(false);
      }
    };

    // Agregar el evento al documento cuando el componente se monta
    document.addEventListener("mousedown", handleOutsideClick);

    // Eliminar el evento cuando el componente se desmonta
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const { socket, reconnecting } = useSocketInvoice();

  const onSubmit: SubmitHandler<IInvoice> = async (values) => {
    setLoading(true);

    const {
      fecha_emision,
      fecha_vencimiento,
      numeroConCeros,
      producto,
      observacion,
      ...rest
    } = values;

    const fechaEmision = (fecha_emision as Dayjs).toDate();
    //Actualizamos la hora de la fecha de emisison
    const fechaActual = new Date(); // Obtener la fecha y hora actual
    const hora = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    const segundos = fechaActual.getSeconds();
    fechaEmision.setHours(hora, minutos, segundos); // Actualizar solo la hora

    const fechaVencimiento = fecha_vencimiento
      ? (fecha_vencimiento as Dayjs).toDate()
      : null;

    const data: IInvoice = {
      ...rest,
      empresa: Number(userGlobal.empresaActual.id),
      establecimiento: Number(userGlobal.empresaActual.establecimiento.id),
      fecha_emision: fechaEmision,
      fecha_vencimiento: fechaVencimiento,
      tipo_documento: myDocument.codigo,
      // total_igv: decimalesSimples(String(sumarIGVTotal())),
      // total_pagar: decimalesSimples(String(sumarImporteTotal())),
      // total_gravada: decimalesSimples(String(sumarOpeGravadasTotal())),
    };

    socket?.volatile.emit("client::newInvoice", data);

    // setTimeout(() => {
    //   setLoading(false);
    // }, 5000);
  };

  const handleIdInvoice = useCallback(
    (data: any) => {
      if (data.estado !== "error") {
        const serie = mySeries.find(
          (item: any) => item.serie === getValues("serie")
        );
        const updateSerie = {
          ...empresa,
          establecimiento: {
            ...empresa.establecimiento,
            documentos: empresa.establecimiento.documentos.map((doc: any) => {
              if (doc.nombre === myDocument.nombre) {
                return {
                  ...doc,
                  series: doc.series.map((item: any) => {
                    if (item.serie === serie.serie) {
                      return {
                        ...item,
                        numero: String(Number(item.numero) + 1),
                        numeroConCeros: data.numeroConCeros,
                      };
                    }
                    return {
                      ...item,
                    };
                  }),
                };
              } else {
                return {
                  ...doc,
                };
              }
            }),
          },
        };

        setUserGlobal({
          ...userGlobal,
          empresaActual: updateSerie,
        });
        sessionStorage.setItem("empresa", JSON.stringify(updateSerie));
        setLoading(data.loading);
      } else {
        setLoading(data.loading);
      }
    },
    [empresa, getValues, myDocument.nombre, mySeries, setUserGlobal, userGlobal]
  );

  useEffect(() => {
    if (socket) {
      socket.on("server::getIdInvoice", handleIdInvoice);

      socket.on("exception", (data: any) => {
        toast.error(data.message);
      });

      return () => {
        socket.off("server::getIdInvoice", handleIdInvoice);
      };
    }
  }, [handleIdInvoice, socket]);

  return (
    <>
      <div className="flex flex-col flex-1 w-full">
        {userGlobal.empresaActual.modo === "DESARROLLO" && (
          <div className="px-3">
            {reconnecting && (
              <Alert severity="error">
                <strong>
                  Se produjo un error en el servidor. Estamos trabajando para
                  solucionarlo. Por favor, inténtalo de nuevo más tarde.
                </strong>
              </Alert>
            )}

            {reconnecting || (
              <Alert severity="warning">
                <span>
                  <strong>DOCUMENTO SIN VALOR:</strong>&nbsp;
                  <span className="text-[#3a3a3a]">
                    Esta empresa está en modo&nbsp;
                    <code className="border border-[hsla(0,0%,39%,.2)] rounded-[3px] p-[.2em_.4em_.1em] m-[0_.2em] bg-[hsla(0,0%,59%,.1)]">
                      <strong>DESARROLLO</strong>
                    </code>
                    &nbsp;
                    <strong>(modo de pruebas)</strong>
                  </span>
                </span>
              </Alert>
            )}
          </div>
        )}
        <FormProvider {...methods}>
          {isActiveModalObs && (
            <ModalObservacion
              control={control}
              open={isActiveModalObs}
              handleClose={handleCloseObservacion}
              agregarObservacion={agregarObservacion}
            />
          )}

          {isActiveModalProductos && (
            <ModalProductos
              watch={watch}
              control={control}
              setValue={setValue}
              open={isActiveModalProductos}
              handleClose={handleCloseProductos}
              agregarProducto={agregarProducto}
              actualizarProducto={actualizarProducto}
              getValues={getValues}
              unregister={unregister}
            />
          )}
          <form>
            {/* HEADER */}
            <div className="flex flex-row  p-2 gap-2 w-full pt-[20px]">
              <div className="w-[70%] flex flex-col">
                <div className="flex w-full p-1 gap-2 relative">
                  <div className="flex gap-2 relative">
                    <label className="flex justify-center items-center gap-2 relative">
                      RUC:
                      <Controller
                        name="ruc"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            hiddenLabel
                            variant="filled"
                            autoComplete="off"
                            inputProps={{ maxLength: 11 }}
                            placeholder="Número de documento"
                            onChange={(e) => {
                              field.onChange(e);
                              setValue("cliente", "");
                              setValue("direccion", "");
                              if (memoEntidades && memoEntidades?.length > 0) {
                                setOpenSearch(true);
                              }
                            }}
                            onClick={() => {
                              if (
                                (dataEntidades && dataEntidades?.length > 0) ||
                                isLoadingEntidades
                              ) {
                                setOpenSearch(true);
                              }
                            }}
                          />
                        )}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={consultarRuc}
                      className="hover:border-blueAction border w-[32px]"
                    >
                      <SearchIcon className="text-borders" />
                    </button>
                    {isOpenSearch && memoEntidades.length > 0 && (
                      <>
                        <div
                          className="absolute bg-white w-full z-[1] bottom-[-2px]"
                          ref={rucSelect}
                        >
                          <div className="absolute h-auto max-h-[130px] bg-white w-full border p-1 overflow-y-auto">
                            {isLoadingEntidades ? (
                              <>
                                <div className="px-2 py-2">Cargando...</div>
                              </>
                            ) : (
                              memoEntidades?.map((item) => {
                                return (
                                  <div
                                    key={item.id}
                                    className={`px-2 py-2 rounded-[6px] hover:bg-primary hover:text-white cursor-pointer ${
                                      ruc === item.numero_documento
                                        ? "bg-primary text-white"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      setValue("ruc", item.numero_documento);
                                      setValue("cliente", item.entidad);
                                      setValue("direccion", item.direccion);
                                      setOpenSearch(false);
                                    }}
                                  >
                                    {item.numero_documento} - {item.entidad}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex w-full p-1">
                  <div className="w-full">
                    <Controller
                      name="cliente"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          hiddenLabel
                          variant="filled"
                          placeholder="Cliente"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex w-full p-1">
                  <div className="w-full">
                    <Controller
                      name="direccion"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          hiddenLabel
                          variant="filled"
                          placeholder="Dirección (opcional)"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex w-full p-1 justify-between">
                  <div className="flex w-1/2">
                    <label className="flex w-full whitespace-nowrap justify-center items-center">
                      F. de Emisión: &nbsp;
                      <Controller
                        name="fecha_emision"
                        control={control}
                        render={({ field }) => {
                          return (
                            <InputDate
                              {...field}
                              open={isOpenDateEmision}
                              onClose={() => setIsOpenDateEmision(false)}
                              minDate={dayjs(new Date()).subtract(3, "days")}
                              maxDate={dayjs(new Date())}
                              format="YYYY-MM-DD"
                              onChange={(e) => {
                                field.onChange(e);
                                setValue("fecha_vencimiento", null);
                              }}
                              slotProps={{
                                textField: {
                                  onClick: () => setIsOpenDateEmision(true),
                                },
                              }}
                            />
                          );
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex w-1/3">
                    <label className="flex w-full whitespace-nowrap justify-center items-center">
                      Vencimiento: &nbsp;
                      <Controller
                        name="fecha_vencimiento"
                        control={control}
                        render={({ field }) => (
                          <InputDate
                            {...field}
                            open={isOpenDateVencimiento}
                            onClose={() => setIsOpenDateVencimiento(false)}
                            minDate={dayjs(watch("fecha_emision"))}
                            format={"YYYY-MM-DD"}
                            slotProps={{
                              field: {
                                clearable: true,
                              },
                              textField: {
                                placeholder: "(opcional)",
                                onClick: () => {
                                  setIsOpenDateVencimiento(true);
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex w-full p-1 gap-2">
                  <div className="w-8/12">
                    <Controller
                      name="tipo_operacion"
                      control={control}
                      render={({ field }) => (
                        <SelectSimple
                          {...field}
                          className="operacion-single"
                          classNamePrefix="select"
                          isSearchable={false}
                          value={[
                            {
                              label: "Venta Interna (productos/servicios)",
                              value: "0101",
                            },
                          ].find(
                            ({ value }) => Number(value) === Number(field.value)
                          )}
                          options={[
                            {
                              label: "Venta Interna (productos/servicios)",
                              value: "0101",
                            },
                          ]}
                          onChange={(e: any) => {
                            field.onChange(e.value);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="w-4/12">
                    <Controller
                      name="moneda"
                      control={control}
                      render={({ field }) => (
                        <SelectSimple
                          {...field}
                          className="moneda-single"
                          classNamePrefix="select"
                          isLoading={isLoadingMonedas}
                          isSearchable={false}
                          placeholder="Moneda"
                          value={monedas.find(
                            ({ value }) => String(value) === String(field.value)
                          )}
                          options={monedas}
                          onChange={(e: any) => {
                            field.onChange(e.value);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="w-[30%] m-1 pt-4 pb-4 border border-dashed border-black flex flex-col justify-between items-center">
                <div className="font-bold h-1/3 flex justify-center items-start">
                  R.U.C. N° {userGlobal.empresaActual?.ruc}
                </div>
                <div className="font-bold h-1/3 flex justify-center items-start">
                  FACTURA ELECTRÓNICA
                </div>
                <div className="h-1/3 flex items-center flex-row w-full justify-between pr-4 pl-4">
                  <select
                    {...register("serie", {
                      onChange: (e) => {
                        const value = e.target.value;
                        const serie = obtenerSerie(value);
                        setValue("numero", serie.numero);
                        setValue("numeroConCeros", serie.numeroConCeros);
                      },
                    })}
                    className="border w-5/12 h-full outline-none cursor-pointer"
                  >
                    {mySeries.map((item: any) => {
                      return (
                        <option key={item.id}>
                          {String(item.serie).toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                  <span className="w-2/12 flex justify-center items-center">
                    -
                  </span>
                  <label className="w-5/12 border h-full flex justify-center items-center">
                    {watch("numeroConCeros")}
                  </label>
                </div>
              </div>
            </div>
            {/* FIN HEADER */}

            {/* BODY */}
            <div className="flex flex-col px-4 gap-4 flex-1 justify-between">
              {/* ITEMS */}
              <div className="flex w-full flex-col">
                {fieldsProducts.length > 0 ? (
                  <>
                    <div className="flex w-full">
                      <table className="w-full">
                        <thead>
                          <tr className="border uppercase bg-disabled text-[#3A3A3A]">
                            <th className="w-[80px]">Cant.</th>
                            <th className="w-[120px]">Codigo</th>
                            <th>Descripcion</th>
                            <th className="w-[140px]">P. Unit</th>
                            <th className="w-[140px]">Total</th>
                            <th></th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {fieldsProducts.map((item, i: number) => {
                            return (
                              <tr key={item.uuid}>
                                <td className="text-right w-[80px]">
                                  <div
                                    className={`border border-bordersAux ${
                                      i === 0 ? "mt-2 mb-1" : "my-1"
                                    } mr-2`}
                                  >
                                    <input
                                      className="w-[80px] px-2 text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.cantidad}
                                    />
                                  </div>
                                </td>
                                <td className="text-left">
                                  <div
                                    className={`border border-bordersAux ${
                                      i === 0 ? "mt-2 mb-1" : "my-1"
                                    } mr-2`}
                                  >
                                    <input
                                      className="w-[120px] px-2 text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.codigo}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div
                                    className={`border border-bordersAux ${
                                      i === 0 ? "mt-2 mb-1" : "my-1"
                                    } mr-2`}
                                  >
                                    <input
                                      className="px-2 w-full text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.descripcion}
                                    />
                                  </div>
                                </td>
                                <td className="text-right">
                                  <div
                                    className={`border border-bordersAux ${
                                      i === 0 ? "mt-2 mb-1" : "my-1"
                                    } mr-2`}
                                  >
                                    <input
                                      className="w-[140px] px-2 text-right text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={String(
                                        item.mtoValorGratuito
                                          ? item.mtoValorGratuito
                                          : item.mtoValorUnitario
                                      )}
                                    />
                                  </div>
                                </td>
                                <td className="text-right">
                                  <div
                                    className={`border border-bordersAux ${
                                      i === 0 ? "mt-2 mb-1" : "my-1"
                                    } mr-2`}
                                  >
                                    <input
                                      className="w-[140px] px-2 text-right text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={String(item.mtoValorVenta)}
                                    />
                                  </div>
                                </td>
                                <td className="text-center w-[30px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setValue("producto", {
                                        ...item,
                                        posicionTabla: i,
                                      });
                                      setActiveModalProductos(true);
                                    }}
                                  >
                                    <BorderColorOutlinedIcon
                                      color="primary"
                                      className="cursor-pointer"
                                    />
                                  </button>
                                </td>
                                <td className="text-center w-[30px]">
                                  <button
                                    type="button"
                                    onClick={() => eliminarProducto(i)}
                                  >
                                    <HighlightOff
                                      color="primary"
                                      className="cursor-pointer"
                                    />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <ButtonSimple
                      onClick={() => setActiveModalProductos(true)}
                      className="w-full !border !border-dashed !border-bordersAux !mt-1"
                    >
                      <AddIcon />
                      Agregar otro item
                    </ButtonSimple>
                  </>
                ) : (
                  <div className="flex justify-center items-center flex-col">
                    <MoveToInboxIcon
                      onClick={() => setActiveModalProductos(true)}
                      sx={{ width: 64, height: 84 }}
                      className="text-borders cursor-pointer"
                    />
                    <ButtonSimple
                      onClick={() => setActiveModalProductos(true)}
                      className="!border !border-dashed !border-bordersAux"
                    >
                      <AddIcon />
                      Agrega un item
                    </ButtonSimple>
                  </div>
                )}
              </div>
              {/* IGV */}
              <div className="flex flex-col flex-1">
                <div className="flex mb-[20px] flex-col gap-2">
                  <div className="flex justify-end w-full h-auto items-center flex-col gap-2">
                    <div className="flex justify-end w-full h-auto items-center">
                      <div className="px-[5px] text-right block flex-[0_0_16%]">
                        Ope. Gravada
                      </div>
                      <div className="px-[5px]">
                        <input
                          className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                          disabled
                          placeholder="0.00"
                          value={decimalesSimples(
                            String(sumarOpeGravadasTotal())
                          )}
                        />
                      </div>
                    </div>
                    {findExoneradas.length > 0 && (
                      <>
                        <div className="flex justify-end w-full h-auto items-center">
                          <div className="px-[5px] text-right block flex-[0_0_16%]">
                            Ope. Exonerada
                          </div>
                          <div className="px-[5px]">
                            <input
                              className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                              disabled
                              placeholder="0.00"
                              value={decimalesSimples(
                                String(sumarExoneradasTotal())
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {findInafectas.length > 0 && (
                      <>
                        <div className="flex justify-end w-full h-auto items-center">
                          <div className="px-[5px] text-right block flex-[0_0_16%]">
                            Ope. Inafecta
                          </div>
                          <div className="px-[5px]">
                            <input
                              className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                              disabled
                              placeholder="0.00"
                              value={decimalesSimples(
                                String(sumarInafectasTotal())
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {findGravadasGratuitas.length > 0 && (
                      <>
                        <div className="flex justify-end w-full h-auto items-center">
                          <div className="px-[5px] text-right block flex-[0_0_16%]">
                            Ope. Gratuita
                          </div>
                          <div className="px-[5px]">
                            <input
                              className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                              disabled
                              placeholder="0.00"
                              value={decimalesSimples(
                                String(sumarOpeGratuitasTotal())
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {findExportaciones.length > 0 && (
                      <>
                        <div className="flex justify-end w-full h-auto items-center">
                          <div className="px-[5px] text-right block flex-[0_0_16%]">
                            Exportación
                          </div>
                          <div className="px-[5px]">
                            <input
                              className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                              disabled
                              placeholder="0.00"
                              value={decimalesSimples(
                                String(sumarExportacionTotal())
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end w-full h-auto items-center">
                    <div className="px-[5px] text-right block flex-[0_0_16%]">
                      IGV
                    </div>
                    <div className="px-[5px]">
                      <input
                        className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                        disabled
                        placeholder="0.00"
                        value={decimalesSimples(String(sumarIGVTotal()))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end w-full h-auto items-center">
                    <div className="px-[5px] text-right block flex-[0_0_16%]">
                      Importe Total
                    </div>
                    <div className="px-[5px]">
                      <input
                        className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                        disabled
                        placeholder="0.00"
                        value={decimalesSimples(String(sumarImporteTotal()))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end w-full h-auto items-center mt-4">
                    <div className="px-[5px] text-right block">
                      Forma de pago
                    </div>
                    <div className="px-[5px]">
                      <Controller
                        name="forma_pago"
                        control={control}
                        render={({ field }) => (
                          <SelectSimple
                            {...field}
                            className="forma_pago-single"
                            classNamePrefix="select"
                            isSearchable={false}
                            placeholder="Forma de pago"
                            isLoading={isLoadingFormaPagos}
                            value={formaPagos.find(
                              ({ value }) =>
                                String(value) === String(field.value)
                            )}
                            options={formaPagos}
                            onChange={(e: any) => {
                              field.onChange(e.value);
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Divider
                  orientation="horizontal"
                  sx={{ marginTop: 0.5, marginBottom: 0.5 }}
                />

                {/* CAJA IMPORTE EN LETRAS Y OBSERVACIONES */}
                <div className="flex flex-col flex-1">
                  {/* IMPORTE EN LETRAS */}
                  <div className="flex w-full border">
                    <span className="px-2 w-auto whitespace-nowrap">
                      IMPORTE EN LETRAS
                    </span>
                    <Divider orientation="vertical" />
                    <span className="px-2 bg-disabled w-full text-textDisabled text-shadow-disabled cursor-not-allowed">
                      {numeroALetras(sumarImporteTotal(), "SOLES")}
                    </span>
                  </div>

                  {/* OBSERVACIONES */}
                  <div className="flex flex-col">
                    {fieldsObs.map((obs: any) => {
                      return (
                        <>
                          <Divider
                            orientation="horizontal"
                            sx={{ marginTop: 0.5, marginBottom: 0.5 }}
                          />
                          <div key={obs.uuid} className="flex w-full">
                            <div className="border w-full bg-disabled text-textDisabled text-shadow-disabled cursor-not-allowed">
                              <span className="px-2 w-auto">
                                {obs.observacion}
                              </span>
                            </div>
                            <div className="w-[60px] flex justify-center items-center">
                              <button
                                type="button"
                                onClick={() => removeObs(obs.uuid)}
                              >
                                <HighlightOff
                                  color="primary"
                                  className="cursor-pointer"
                                />
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>

                  {/* BOTON AGREGAR OBSERVACIONES */}
                  <div className="flex w-full flex-col mt-[4px]">
                    <ButtonSimple
                      onClick={() => setActiveModalObs(true)}
                      className="w-full !border !border-dashed !border-bordersAux"
                    >
                      <AddIcon />
                      Agregar Observaciones o Notas
                    </ButtonSimple>
                  </div>
                </div>

                {/* CAJA EMITIR FACTURA */}
                <div className="w-full flex mb-4 mt-4">
                  <div className="flex justify-end items-end w-full">
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!isDirty || !isValid || loading}
                      onClick={(e) => handleSubmit(onSubmit)(e)}
                    >
                      {loading ? (
                        <span>
                          Emitiendo factura...{" "}
                          <CachedIcon className="animate-spin" />
                        </span>
                      ) : (
                        "Emitir Factura"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
};

export default FacturaScreen;
