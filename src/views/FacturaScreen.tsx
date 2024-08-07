import { ModalContext } from "../context/modalContext";
import {
  BaseSyntheticEvent,
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
import { IProducto } from "../interface/producto.interface";
import { IInvoice } from "../interface/invoice.interface";
import { getPersona } from "../api/ext";
import { fixed, isError, round } from "../utils/functions";
import { toast } from "react-toastify";
import { useMonedas } from "../hooks/useMoneda";
import { useFormaPago } from "../hooks/useFormaPago";
import { useEntidadesByEmpresa } from "../hooks/useEntidades";
import { useSocketInvoice } from "../hooks/useSocket";
import CachedIcon from "@mui/icons-material/Cached";
import { numeroALetras } from "../utils/letras_numeros";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const INITIAL_PRODUCTO: IProducto = {
  tipAfeIgv: "10",
  cantidad: 1,
  unidad: "NIU",
  codigo: "",
  descripcion: "",
  porcentajeIgv: 18,
  mtoValorUnitario: "",
  // mtoBaseIgv: "0.00",
  // igv: "0.00",
  // totalImpuestos: "0.00",
  // mtoTotalItem: "0.00",
  //igvUnitario: 0,
  //mtoPrecioUnitario: 0,
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

interface IProductsExtend extends IProducto {
  uuid?: string;
  mtoPrecioUnitario: string;
  mtoTotalItem: string;
}

interface IProductTable {
  operacion_gravada: number;
  igv: number;
  operacion_exonerada: number;
  operacion_inafecta: number;
  operacion_exportacion: number;
  operacion_gratuita: number;
  operacion_total: number;
  items: IProductsExtend[];
}

const FacturaScreen = () => {
  const { userGlobal, setUserGlobal, dialogState } = useContext(ModalContext);
  const [isActiveModalObs, setActiveModalObs] = useState(false);
  const [isActiveModalProductos, setActiveModalProductos] = useState(false);
  const [isOpenDateEmision, setIsOpenDateEmision] = useState(false);
  const [isOpenDateVencimiento, setIsOpenDateVencimiento] = useState(false);
  const [isNewItem, setNewItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openBackdrop, setBackdrop] = useState(false);
  const [confirmDialog, setConfigDialog] = useState(false);
  const [isDraft, setDraft] = useState(false);

  const handleCloseBackdrop = () => setBackdrop(false);
  const handleOpenBackdrop = (e: any) => {
    setBackdrop(true);
    handleSubmit((data) => onSubmit(data, isDraft))(e);
    handleCloseConfirmDialog();
  };

  const handleCloseConfirmDialog = () => {
    setConfigDialog(false);
    setDraft(false);
  };
  const handleOpenConfirmDialog = (draft: boolean) => {
    setConfigDialog(true);
    setDraft(draft);
  };

  //const [format, setFormat] = useState<string | undefined>("");
  const empresa = JSON.parse(String(sessionStorage.getItem("empresa")));

  const myDocument = empresa.establecimiento.documentos.find(
    (doc: any) => String(doc.nombre).toUpperCase() === "FACTURA"
  );

  const mySeries = useMemo(() => {
    return myDocument?.series ?? [];
  }, [myDocument]);

  const methods = useForm<IInvoice>({
    defaultValues: {
      ...INITIAL_FACTURA,
      productos: dialogState.payload ? dialogState.payload.productos : [],
    },
    values: dialogState.payload
      ? {
          ...dialogState.payload,
        }
      : {
          ...INITIAL_FACTURA,
          serie: mySeries[0].serie,
          numero: mySeries[0].numero,
          numeroConCeros: mySeries[0].numeroConCeros,
          //fecha_emision: dayjs(new Date()),
        },
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, dirtyFields, touchedFields },
    watch,
    getValues,
    setValue,
    unregister,
    setError,
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
    setNewItem(false);
  };

  const DECIMAL = 6;

  const operacionesProductos = fieldsProducts.reduce(
    (prev: IProductTable, curr) => {
      //gravada onerosa
      if (curr.tipAfeIgv === "10") {
        const mtoValorUnitario = round(Number(curr.mtoValorUnitario), DECIMAL);
        const porcentaje = Number(curr.porcentajeIgv);
        const cantidad = Number(curr.cantidad);
        const igv = round(mtoValorUnitario * (porcentaje / 100), DECIMAL);

        const precioUnitario = mtoValorUnitario + igv;
        const totalItem = (mtoValorUnitario + igv) * cantidad;

        prev.items.push({
          ...curr,
          mtoPrecioUnitario: fixed(precioUnitario, DECIMAL),
          mtoTotalItem: fixed(totalItem),
        });
        prev.operacion_gravada += round(mtoValorUnitario * cantidad);
        prev.igv += round(igv * cantidad);
        prev.operacion_total +=
          round(mtoValorUnitario * cantidad) + round(igv * cantidad);
      }

      //exonerado onerosa
      if (curr.tipAfeIgv === "20") {
        const mtoValorUnitario = round(Number(curr.mtoValorUnitario), DECIMAL);
        const cantidad = Number(curr.cantidad);
        const precioUnitario = mtoValorUnitario + 0;
        const totalItem = round(
          Number((mtoValorUnitario + 0) * cantidad),
          DECIMAL
        );

        prev.items.push({
          ...curr,
          mtoPrecioUnitario: fixed(precioUnitario, DECIMAL),
          mtoTotalItem: fixed(totalItem),
        });

        prev.operacion_exonerada += totalItem;
        prev.operacion_total += totalItem;
      }

      //inafecta onerosa(30) y exportacion(40)
      if (curr.tipAfeIgv === "30" || curr.tipAfeIgv === "40") {
        const mtoValorUnitario = round(Number(curr.mtoValorUnitario), DECIMAL);
        const cantidad = Number(curr.cantidad);
        const precioUnitario = mtoValorUnitario + 0;
        const totalItem = round(
          Number((mtoValorUnitario + 0) * cantidad),
          DECIMAL
        );

        prev.items.push({
          ...curr,
          mtoPrecioUnitario: fixed(precioUnitario, DECIMAL),
          mtoTotalItem: fixed(totalItem),
        });

        prev.operacion_inafecta += totalItem;
        prev.operacion_total += totalItem;
      }

      //gratuitas gravadas("11", "12", "13", "14", "15", "16", "17"), inafectas("31", "32", "33", "34", "35", "36", "37") e exonorado transfe gratuitas(21)
      if (
        [
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "21",
          "31",
          "32",
          "33",
          "34",
          "35",
          "36",
          "37",
        ].includes(curr.tipAfeIgv)
      ) {
        const mtoValorUnitario = round(Number(curr.mtoValorUnitario), DECIMAL);
        const cantidad = Number(curr.cantidad);
        const totalItem = round(Number(mtoValorUnitario * cantidad), DECIMAL);

        prev.items.push({
          ...curr,
          mtoPrecioUnitario: fixed(mtoValorUnitario, DECIMAL),
          mtoTotalItem: fixed(totalItem),
        });

        prev.operacion_gratuita += totalItem;
      }

      return prev;
    },
    {
      operacion_gravada: 0,
      operacion_exonerada: 0,
      operacion_inafecta: 0,
      operacion_exportacion: 0,
      operacion_gratuita: 0,
      operacion_total: 0,
      igv: 0,
      items: [],
    }
  );

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

  const onSubmit = async (values: IInvoice, borrador: boolean) => {
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
      borrador: borrador,
      // total_igv: decimalesSimples(String(sumarIGVTotal())),
      // total_pagar: decimalesSimples(String(sumarImporteTotal())),
      // total_gravada: decimalesSimples(String(sumarOpeGravadasTotal())),
    };

    console.log(data);
    // return;
    socket?.volatile.emit("client::newInvoice", data);

    // setTimeout(() => {
    //   setLoading(false);
    // }, 5000);
  };

  const handleIdInvoice = useCallback(
    (data: any) => {
      switch (data.estado) {
        case "success": {
          setSuccess(true);
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
          handleCloseBackdrop();
          break;
        }

        case "error": {
          setLoading(data.loading);
          handleCloseBackdrop();
          break;
        }
      }
    },
    [empresa, getValues, myDocument.nombre, mySeries, setUserGlobal, userGlobal]
  );

  useEffect(() => {
    if (socket) {
      socket.on("server::getIdInvoice", handleIdInvoice);

      socket.on("exception", (data: any) => {
        toast.error(data.message);
        setLoading(false);
      });

      return () => {
        socket.off("server::getIdInvoice", handleIdInvoice);
        socket.off("exception");
      };
    }
  }, [handleIdInvoice, socket]);

  useEffect(() => {
    if (!dialogState.payload) {
      setValue("fecha_emision", dayjs(new Date()));
    }
  }, [dialogState.payload, setValue]);

  return (
    <>
      <div className="flex flex-col flex-1 w-full">
        {confirmDialog ? (
          <Dialog
            open={true}
            aria-labelledby="alert-dialog-title-confirm"
            aria-describedby="alert-dialog-description-confirm"
          >
            <DialogTitle id="alert-dialog-title-confirm">Confirmar</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description-confirm">
                Confirme que desea generar este documento.
              </DialogContentText>

              <div className="flex gap-2 flex-col mt-3">
                <Button
                  fullWidth
                  color="error"
                  variant="contained"
                  onClick={handleCloseConfirmDialog}
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  color="success"
                  variant="contained"
                  onClick={handleOpenBackdrop}
                >
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}

        {loading ? (
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={openBackdrop}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        ) : (
          success && (
            <Dialog
              open={true}
              aria-labelledby="alert-dialog-title-success"
              aria-describedby="alert-dialog-description-success"
            >
              <DialogTitle id="alert-dialog-title-success">
                FACTURA ELECTRÓNICA
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description-success">
                  FFF1-5
                </DialogContentText>
                <DialogContentText id="alert-dialog-description-success">
                  TOTAL: S/118.0
                </DialogContentText>
                <div className="w-full border py-3 px-5 flex justify-center items-center mt-2">
                  <Button variant="contained" color="primary">
                    IMPRIMIR
                  </Button>
                </div>
                <div className="w-full border py-3 px-5 flex gap-2 justify-center items-center mt-2">
                  <Button variant="contained" color="secondary">
                    VER PDF
                  </Button>
                  <Button variant="contained" color="success">
                    DESCARGAR XML
                  </Button>
                  <Button variant="contained" color="primary">
                    DESCARGAR CDR
                  </Button>
                </div>
                <div className="w-full border py-3 px-5 gap-2 flex flex-col justify-center items-center mt-2">
                  <a>Enviar al WhatsApp del cliente</a>
                  <a>Enviar al correo del cliente</a>
                  <a>Enviar a un correo personalizado</a>
                  <a>Generar otra FACTURA</a>
                  <a>Enviar otra BOLETA DE VENTA</a>
                  <a>Ver comprobantes</a>
                </div>
                <div className="w-full border py-3 px-5 flex justify-center items-center mt-2">
                  <Button variant="contained" color="primary" fullWidth>
                    ANULAR o comunicat de baja
                  </Button>
                </div>
                <div className="w-full border py-3 px-5 flex gap-2 mt-2">
                  <span>
                    Enviada a la Sunat?: Aceptada por la Sunat?: Código: 0
                    Descripción: La Factura Electrónica FFF1-5 ha sido ACEPTADA
                    CON OBSERVACIONES Otros:
                  </span>
                </div>
              </DialogContent>
            </Dialog>
          )
        )}

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
              errors={errors}
              setError={setError}
              isNewItem={isNewItem}
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
                          {operacionesProductos.items.map((item, i: number) => {
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
                                      value={item.mtoPrecioUnitario}
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
                                      value={item.mtoTotalItem}
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
                      onClick={() => {
                        setActiveModalProductos(true);
                        setNewItem(true);
                      }}
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
                      onClick={() => {
                        setActiveModalProductos(true);
                        setNewItem(true);
                      }}
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
                          value={operacionesProductos.operacion_gravada.toFixed(
                            2
                          )}
                        />
                      </div>
                    </div>
                    {operacionesProductos.operacion_exonerada > 0 && (
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
                              value={operacionesProductos.operacion_exonerada.toFixed(
                                2
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {operacionesProductos.operacion_inafecta > 0 && (
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
                              value={operacionesProductos.operacion_inafecta.toFixed(
                                2
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {operacionesProductos.operacion_gratuita > 0 && (
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
                              value={operacionesProductos.operacion_gratuita.toFixed(
                                2
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
                        value={operacionesProductos.igv.toFixed(2)}
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
                        value={operacionesProductos.operacion_total.toFixed(2)}
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
                  {/* IMPORTE EN LETRAS  0.000118*/}
                  <div className="flex w-full border">
                    <span className="px-2 w-auto whitespace-nowrap">
                      IMPORTE EN LETRAS
                    </span>
                    <Divider orientation="vertical" />
                    <span className="px-2 bg-disabled w-full text-textDisabled text-shadow-disabled cursor-not-allowed">
                      {numeroALetras(operacionesProductos.operacion_total)}
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
                <div className="w-full flex mb-4 mt-4 gap-2">
                  <div className="flex w-1/2">
                    <Button
                      fullWidth
                      disabled={loading}
                      variant="contained"
                      color="secondary"
                      onClick={() => handleOpenConfirmDialog(true)}
                    >
                      {/* (e) =>
                        handleSubmit((data, event) =>
                          onSubmit(data, event, true)
                        )(e) */}
                      {isDraft && loading ? (
                        <span>
                          GUARDANDO BORRADOR...{" "}
                          <CachedIcon className="animate-spin" />
                        </span>
                      ) : (
                        "GUARDAR COMO BORRADOR"
                      )}
                    </Button>
                  </div>
                  <div className="flex w-1/2">
                    <Button
                      fullWidth
                      disabled={loading}
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenConfirmDialog(false)}
                    >
                      {!isDraft && loading ? (
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
