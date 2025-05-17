import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InputText from "../../../components/Material/Input/InputText";
import SearchIcon from "@mui/icons-material/Search";
import { SelectSimple } from "../../../components/common/Selects/SelectSimple";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import AddIcon from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";
import { FaTrashAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import ButtonSimple from "../../../components/Material/Button/ButtonSimple";
import Alert from "@mui/material/Alert";
import { useForm, Controller, useFieldArray, FormProvider, Resolver } from "react-hook-form";
import dayjs from "dayjs";
import ModalObservacion from "../components/Factura/FacturaModalObservacion";
import ModalProductos from "../components/Factura/FacturaModalProducto";
import { FaEdit } from "react-icons/fa";
import InputDate from "../../../components/Material/Input/InputDate";
import { getRucSunat } from "../../../services/api/ext.service";
import { fixed, isError, round } from "../../../utils/functions.utils";
import { toast } from "sonner";
import { useMonedas } from "../../Monedas/hooks/useMoneda";
import { useFormaPago } from "../../TiposFormaPago/hooks/useFormaPago";
import { useEntidadesByEmpresa } from "../../Entidades/hooks/useEntidades";
import { useSocketInvoice } from "../../../hooks/useSocket";
import CachedIcon from "@mui/icons-material/Cached";
import { numeroALetras } from "../../../utils/letras_numeros.utils";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FaCheck } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IDTOQueryInvoiceRegistered } from "../../../interfaces/models/invoices/invoice.interface";
import { PageEnum } from "../../../types/enums/page.enum";
import { IAuthEmpresa } from "../../../interfaces/models/auth/auth.interface";
import { useUserStore } from "../../../store/zustand/user-zustand";
import { usePageStore } from "../../../store/zustand/page-zustand";
import Grid from "@mui/material/Grid2";
import { yupResolver } from "@hookform/resolvers/yup";
import { IFormInvoice } from "../../../interfaces/forms/invoices/invoice.interface";
import { IFeatureInvoice, IFeatureInvoiceProductTable } from "../../../interfaces/features/invoices/invoice.interface";
import { FORM_INITIAL_INVOICE, FORM_MODAL_PRODUCT_INVOICE } from "../../../config/constants";
import { _schemaTypeFormInvoice, schemaFormInvoice } from "../validations/invoice.schema";
import { SendModeSunat } from "../../../types/enums/send_mode_sunat.enum";
import { StatusInvoice } from "../../../interfaces/components/invoices/status-invoices.interface";
//import { DevTool } from "@hookform/devtools";

const OPTIONS_INITIAL = {
  whatsapp: false,
  correo: false,
  correoPersonalizado: false,
};

const STATUS_INITIAL: StatusInvoice = {
  codigo_estado: 0,
  nombre_estado: "GENERANDO",
  mensaje: "Generando documento...",
  invoiceId: 0,
  loading: false,
  codigo: "",
  otros: "",
  sendMode: "",
  xml: undefined,
  cdr: undefined,
  pdfA4: undefined,
};

const FacturaScreen = () => {
  const DECIMAL = 6;
  const userGlobal = useUserStore((state) => state.userGlobal);
  const setUserGlobal = useUserStore((state) => state.setUserGlobal);
  const setPage = usePageStore((state) => state.setPage);
  const page = usePageStore((state) => state.page);
  const [isActiveModalObs, setActiveModalObs] = useState(false);
  const [isActiveModalProductos, setActiveModalProductos] = useState(false);
  const [isOpenDateEmision, setIsOpenDateEmision] = useState(false);
  const [isOpenDateVencimiento, setIsOpenDateVencimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openBackdrop, setBackdrop] = useState(false);
  const [confirmDialog, setConfigDialog] = useState(false);
  const [isDraft, setDraft] = useState(false);
  const [invoiceRegistered, setInvoiceRegistered] = useState<IDTOQueryInvoiceRegistered | null>(null);
  const [options, setOptions] = useState(OPTIONS_INITIAL);
  const [nroWsp, setNroWsp] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [objectFit, setObjectFit] = useState<"object-cover" | "object-fill">("object-cover");
  const [statusInvoice, setStatusInvoice] = useState<StatusInvoice | null>(STATUS_INITIAL || null);

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
  const handleOpenConfirmDialog = async (draft: boolean) => {
    const validForm = await trigger();
    if (validForm) {
      setConfigDialog(true);
      setDraft(draft);
    }
  };

  const CPE = userGlobal?.empresaActual?.establecimiento?.pos?.documentos?.find(
    (doc) => String(doc.nombre).toUpperCase() === "FACTURA"
  );

  const configEstablishment = userGlobal?.empresaActual?.establecimiento?.configuraciones?.[0];
  const sendModeSunat = configEstablishment?.envio_sunat_modo;

  const CPE_SERIES = useMemo(() => {
    return CPE?.series.filter((serie) => serie.estado) || [];
  }, [CPE]);

  const methods = useForm<IFeatureInvoice>({
    defaultValues: {
      ...FORM_INITIAL_INVOICE,
      details: page.payload?.details || [],
      observaciones: page.payload?.observaciones || [],
    },
    values: page.payload || {
      ...FORM_INITIAL_INVOICE,
      serie: CPE_SERIES?.[0]?.serie || "",
      numero: CPE_SERIES?.[0]?.numero || "",
      numeroConCeros: CPE_SERIES?.[0]?.numeroConCeros || "",
    },
    resolver: yupResolver(schemaFormInvoice) as Resolver<_schemaTypeFormInvoice>,
    context: {
      isModalOpen: isActiveModalProductos,
      isModalObsOpen: isActiveModalObs,
    },
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
    setValue,
    setError,
    reset,
    trigger,
    unregister,
  } = methods;

  const {
    fields: fieldsObs,
    append: appendObs,
    remove: removeObs,
  } = useFieldArray({
    control,
    name: "observaciones",
    keyName: "uuid",
  });

  const {
    fields: fieldsProducts,
    append: appendProducts,
    remove: removeProducts,
    update: updateProducts,
  } = useFieldArray({
    control,
    name: "details",
    keyName: "uuid",
  });

  const eliminarProducto = (posicionTabla: number) => {
    removeProducts(posicionTabla);
  };

  const agregarProducto = () => {
    appendProducts(getValues("producto") ?? FORM_MODAL_PRODUCT_INVOICE);
    handleCloseProductos();
  };

  const agregarObservacion = async () => {
    const validObs = await trigger("observacion");
    if (!validObs) return;
    appendObs({
      observacion: String(getValues("observacion")),
      uuid: undefined,
    });
    handleCloseObservacion();
  };

  const actualizarProducto = (posicionTabla: number) => {
    updateProducts(posicionTabla, getValues("producto") ?? FORM_MODAL_PRODUCT_INVOICE);
    handleCloseProductos();
  };

  const obtenerSerie = (serie: string) => {
    const correlativo = CPE_SERIES.find((item: any) => item.serie === serie);
    return correlativo;
  };

  const handleCloseObservacion = async () => {
    setActiveModalObs(false);
    await trigger("observacion");
    unregister("observacion");
  };

  const handleCloseProductos = async () => {
    setActiveModalProductos(false);
    await trigger();
    unregister("producto");
  };

  const operacionesProductos = fieldsProducts.reduce(
    (prev: IFeatureInvoiceProductTable, curr) => {
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
        prev.operacion_total += round(mtoValorUnitario * cantidad) + round(igv * cantidad);
      }

      //exonerado onerosa
      if (curr.tipAfeIgv === "20") {
        const mtoValorUnitario = round(Number(curr.mtoValorUnitario), DECIMAL);
        const cantidad = Number(curr.cantidad);
        const precioUnitario = mtoValorUnitario + 0;
        const totalItem = round(Number((mtoValorUnitario + 0) * cantidad), DECIMAL);

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
        const totalItem = round(Number((mtoValorUnitario + 0) * cantidad), DECIMAL);

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
        ["11", "12", "13", "14", "15", "16", "17", "21", "31", "32", "33", "34", "35", "36", "37"].includes(
          curr.tipAfeIgv
        )
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
    //error: errorEntidades,
    isLoading: isLoadingEntidades,
  } = useEntidadesByEmpresa(Number(userGlobal?.empresaActual?.id));

  const [isOpenSearch, setOpenSearch] = useState(false);
  const rucSelect = useRef<HTMLDivElement>(null);
  const ruc = watch("ruc");

  const memoEntidades = useMemo(() => {
    let result = dataEntidades ?? [];

    if (ruc.length > 0) {
      //filtrar por ruc
      result = dataEntidades?.filter((item) => item.numero_documento.toLowerCase().includes(ruc)) ?? [];
    }

    return result;
  }, [dataEntidades, ruc]);

  const consultarRuc = async () => {
    const validRuc = await trigger("ruc");
    if (!validRuc) return;

    setOpenSearch(false);

    try {
      const entidad = await getRucSunat(getValues("ruc"));
      if (!entidad.lista) {
        toast.error(entidad.error);
        setValue("cliente", "");
        setValue("direccion", "");
        return;
      }

      const { apenomdenunciado, desdepartamento, desprovincia, direstablecimiento } = entidad.lista[0];

      const departamento = String(desdepartamento).toUpperCase().trim();
      const provincia = String(desprovincia).toUpperCase().trim();
      const direccion = String(direstablecimiento).toUpperCase().trim();
      const razonSocial = String(apenomdenunciado).toUpperCase().trim();
      setValue("cliente", razonSocial);
      setValue("direccion", `${direccion} ${provincia} ${departamento}`);
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const { data: dataMonedas, isLoading: isLoadingMonedas } = useMonedas();

  const monedas =
    dataMonedas?.map((item) => {
      const abreviado = item.abreviado.charAt(0).toUpperCase() + item.abreviado.slice(1);
      return {
        label: `${item.abrstandar} - (${item.simbolo}) ${abreviado}`,
        value: item.abrstandar,
      };
    }) ?? [];

  const { data: dataFormaPagos, isLoading: isLoadingFormaPagos } = useFormaPago();

  const formaPagos =
    dataFormaPagos?.map((item) => {
      return {
        label: item.forma_pago,
        value: item.forma_pago,
      };
    }) ?? [];

  const { socket, reconnecting } = useSocketInvoice();

  const handleNewFactura = () => {
    setSuccess(false);
    setStatusInvoice(STATUS_INITIAL);
    setInvoiceRegistered(null);
  };

  const onSubmit = async (values: IFeatureInvoice, borrador: boolean) => {
    setLoading(true);

    const { fecha_emision, fecha_vencimiento } = values;

    const fechaEmision = dayjs(fecha_emision).toDate();
    const fechaVencimiento = fecha_vencimiento ? dayjs(fecha_vencimiento).toDate() : undefined;

    const data: IFormInvoice = {
      tipo_documento: values.tipo_documento,
      serie: values.serie,
      numero: values.numero,
      tipo_entidad: values.tipo_entidad,
      ruc: values.ruc,
      cliente: values.cliente,
      direccion: values.direccion,
      fecha_emision: fechaEmision,
      fecha_vencimiento: fechaVencimiento,
      tipo_operacion: values.tipo_operacion,
      moneda: values.moneda,
      details: values.details,
      forma_pago: values.forma_pago,
      observaciones: values.observaciones?.map((item) => item.observacion),
      empresa: Number(userGlobal?.empresaActual?.id),
      establecimiento: Number(userGlobal?.empresaActual?.establecimiento?.id),
      borrador: borrador,
      id: values.id,
      pos: Number(userGlobal?.empresaActual?.establecimiento?.pos?.id),
    };
    // return;
    socket?.volatile.emit("client::newInvoice", data);
  };

  const handleIdInvoice = useCallback(
    (data: any) => {
      switch (data.estado) {
        case "success": {
          setInvoiceRegistered(data);
          setSuccess(true);

          //Reiniciamos valores por defecto excepto la serie y correlativos
          setPage({
            namePage: PageEnum.SCREEN_FACTURA,
            open: true,
            pageComplete: true,
            payload: null,
          });
          reset();
          setValue("serie", data.serie);
          setValue("numero", data.numero);
          setValue("numeroConCeros", data.numeroConCeros);

          const serie = CPE_SERIES.find((item) => item.serie === data.serie);

          //Mutamos el correlativo en la serie de la empresa globalmente
          const updateSerie: IAuthEmpresa = {
            ...userGlobal?.empresaActual,
            establecimiento: {
              ...userGlobal?.empresaActual?.establecimiento,
              pos: {
                ...userGlobal?.empresaActual?.establecimiento?.pos,
                documentos: userGlobal?.empresaActual?.establecimiento?.pos?.documentos?.map((doc) => {
                  if (doc.nombre === CPE?.nombre) {
                    return {
                      ...doc,
                      series: doc.series.map((item) => {
                        if (item.serie === serie?.serie) {
                          return {
                            ...item,
                            numero: data.numero,
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
            },
          };

          //Actualizamos la nueva mutacion del correlativo
          setUserGlobal((user) => {
            return {
              ...user,
              empresaActual: updateSerie,
            };
          });
          // sessionStorage.setItem("empresaActual", JSON.stringify(updateSerie));
          setLoading(false);
          handleCloseBackdrop();
          break;
        }

        case "error": {
          setLoading(false);
          handleCloseBackdrop();
          break;
        }
      }
    },
    [setUserGlobal, setPage, userGlobal, reset, setValue, CPE_SERIES, CPE?.nombre]
  );

  const handleStatusInvoice = (data: any) => {
    setStatusInvoice(data);
    setInvoiceRegistered((old) => {
      if (old) {
        return {
          ...old,
          enviada_sunat: data.codigo_estado,
          aceptada_sunat: data.nombre_estado,
          mensaje_sunat: data.mensaje,
          codigo_sunat: data?.codigo,
          otros_sunat: data?.otros,
          xml: data?.xml,
          cdr: data?.cdr,
          pdfA4: data?.pdfA4,
        };
      }
      return null;
    });
  };

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

  useEffect(() => {
    if (socket) {
      socket.on("server::getIdInvoice", handleIdInvoice);
      socket.on("server::statusInvoice", handleStatusInvoice);

      socket.on("exception", (data: any) => {
        toast.error(data.message);
        setLoading(false);
      });

      return () => {
        socket.off("error");
        socket.off("server::getIdInvoice", handleIdInvoice);
        socket.off("server::statusInvoice", handleStatusInvoice);
        socket.off("exception");
      };
    }
  }, [handleIdInvoice, socket, handleStatusInvoice]);

  useEffect(() => {
    const imgElement = imgRef.current;

    const handleLoad = () => {
      if (imgElement) {
        if (imgElement.naturalWidth > imgElement.naturalHeight) {
          setObjectFit("object-fill");
        } else {
          setObjectFit("object-cover");
        }
      }
    };

    if (imgElement?.complete) {
      handleLoad(); // Si la imagen ya está cargada
    } else {
      imgElement?.addEventListener("load", handleLoad);
    }

    return () => {
      imgElement?.removeEventListener("load", handleLoad);
    };
  }, []);

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
                <Button fullWidth color="error" variant="contained" onClick={handleCloseConfirmDialog}>
                  Cancelar
                </Button>
                <Button fullWidth color="success" variant="contained" onClick={handleOpenBackdrop}>
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}

        {loading ? (
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1, display: "flex", flexDirection: "column" }}
            open={openBackdrop}
          >
            <CircularProgress color="inherit" />
            <label>{statusInvoice?.mensaje}</label>
          </Backdrop>
        ) : (
          success && (
            <Dialog
              open={true}
              aria-labelledby="alert-dialog-title-success"
              aria-describedby="alert-dialog-description-success"
            >
              <DialogTitle id="alert-dialog-title-success">
                <Alert
                  icon={false}
                  severity={
                    invoiceRegistered?.aceptada_sunat === "RECHAZADO" ||
                    invoiceRegistered?.aceptada_sunat === "ERROR_CONTRIBUYENTE"
                      ? "error"
                      : "success"
                  }
                  className="text-center flex justify-center"
                >
                  {invoiceRegistered?.borrador
                    ? "Guardado. Los borradores no se envian a SUNAT."
                    : `${
                        sendModeSunat !== SendModeSunat.NO_ENVIA
                          ? invoiceRegistered?.aceptada_sunat === "RECHAZADO"
                            ? "Generado con rechazo."
                            : invoiceRegistered?.aceptada_sunat === "ERROR_CONTRIBUYENTE"
                              ? "Estimado contribuyente SUNAT encontró una excepción en el documento"
                              : "Generado con éxito."
                          : "Generado con éxito. Segun configuraciones este documento no envia a SUNAT."
                      }`}
                </Alert>
              </DialogTitle>
              <DialogContent>
                <h3 className="flex justify-center items-center text-[24px] mt-2">{invoiceRegistered?.documento}</h3>
                <h4 className="flex justify-center items-center text-[24px]">
                  {invoiceRegistered?.serie}-{invoiceRegistered?.correlativo_registrado}
                </h4>
                <h4 className="flex justify-center items-center text-[24px]">TOTAL: {invoiceRegistered?.total}</h4>
                {invoiceRegistered?.aceptada_sunat === "ERROR" ||
                  invoiceRegistered?.aceptada_sunat === "ERROR_CONTRIBUYENTE" || (
                    <div className="w-full border py-3 px-5 flex justify-center items-center mt-2">
                      <Button
                        className="hover:text-white"
                        component="a"
                        target="_blank"
                        href={invoiceRegistered?.pdfA4}
                        rel="noopener noreferrer"
                        variant="contained"
                        color="primary"
                      >
                        IMPRIMIR
                      </Button>
                    </div>
                  )}

                {invoiceRegistered?.aceptada_sunat === "ERROR" ||
                  invoiceRegistered?.aceptada_sunat === "ERROR_CONTRIBUYENTE" || (
                    <div className="w-full border py-3 px-5 flex gap-2 justify-center items-center mt-2">
                      <Button
                        component="a"
                        target="_blank"
                        href={invoiceRegistered?.pdfA4}
                        rel="noopener noreferrer"
                        variant="contained"
                        color="secondary"
                        className="hover:text-white"
                      >
                        VER PDF
                      </Button>

                      {/* https://greenter.dev/faq/#facturas */}
                      {/* 0100 a 999	Excepciones	SUNAT Corregir y volver a enviar la factura */}
                      {/* 1000 a 1999	Excepciones	Contribuyente Corregir y volver a enviar la factura */}
                      {/* 2000 a 3999	Errores (Rechazo)	Emitir una nueva factura */}
                      {/* >4000	Observaciones	Corregir en futuras facturas */}
                      {(invoiceRegistered?.aceptada_sunat === "ACEPTADO" ||
                        invoiceRegistered?.aceptada_sunat === "RECHAZADO") && (
                        <>
                          <Button
                            component="a"
                            href={invoiceRegistered?.xml}
                            variant="contained"
                            color="success"
                            className="hover:text-white"
                          >
                            DESCARGAR XML
                          </Button>
                          <Button
                            component="a"
                            href={invoiceRegistered?.cdr}
                            variant="contained"
                            color="primary"
                            className="hover:text-white"
                          >
                            DESCARGAR CDR
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                <div className="w-full border py-3 px-5 gap-2 flex flex-col justify-center items-center mt-2 cursor-pointer">
                  {invoiceRegistered?.aceptada_sunat === "RECHAZADO" ||
                    invoiceRegistered?.aceptada_sunat === "ERROR_CONTRIBUYENTE" ||
                    invoiceRegistered?.borrador || (
                      <>
                        <a
                          onClick={() =>
                            setOptions({
                              ...OPTIONS_INITIAL,
                              whatsapp: true,
                            })
                          }
                        >
                          Enviar al WhatsApp del cliente
                        </a>

                        {options.whatsapp && (
                          <div className="flex gap-2">
                            <div className="flex justify-center items-center">
                              <label>
                                +51
                                <input
                                  className="border outline-none px-2"
                                  type="text"
                                  placeholder="Ingrese celular"
                                  value={nroWsp}
                                  minLength={9}
                                  maxLength={9}
                                  onChange={(e) => setNroWsp(e.target.value)}
                                />
                              </label>
                            </div>
                            <div className="flex flex-col gap-1 ">
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://web.whatsapp.com/send?phone=51${nroWsp}&text=${encodeURI(`Estimado cliente, Se envía la ${invoiceRegistered?.documento} ${invoiceRegistered?.serie}-${invoiceRegistered?.correlativo_registrado}. Para ver click en el siguiente enlace: https://www.nubefact.com/cpe/bd70e07a-a834-4639-afd9-97277d3bd760.pdf`)}`}
                                className="border px-2 text-default hover:no-underline hover:bg-bordersAux hover:text-default"
                              >
                                Enviar por WhatsApp Web
                              </a>
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://api.whatsapp.com/send?phone=51${nroWsp}&text=${encodeURI(`Estimado cliente, Se envía la ${invoiceRegistered?.documento} ${invoiceRegistered?.serie}-${invoiceRegistered?.correlativo_registrado}. Para ver click en el siguiente enlace: https://www.nubefact.com/cpe/bd70e07a-a834-4639-afd9-97277d3bd760.pdf`)}`}
                                className="border px-2 text-default hover:no-underline hover:bg-bordersAux hover:text-default"
                              >
                                Enviar por WhatsApp App
                              </a>
                            </div>
                          </div>
                        )}

                        <a
                          onClick={() =>
                            setOptions({
                              ...OPTIONS_INITIAL,
                              correo: true,
                            })
                          }
                        >
                          Enviar al correo del cliente
                        </a>
                        {options.correo && (
                          <div className="flex gap-2">
                            <div className="flex justify-center items-center gap-2">
                              <label>
                                Correo: &nbsp;
                                <input
                                  className="border outline-none px-2"
                                  type="email"
                                  placeholder="Ingrese correo"
                                  value="correop@gmail.com"
                                  disabled
                                  onChange={(e) => setNroWsp(e.target.value)}
                                />
                              </label>
                              <button className="border px-2 hover:bg-bordersAux">Enviar</button>
                            </div>
                          </div>
                        )}

                        <a
                          onClick={() =>
                            setOptions({
                              ...OPTIONS_INITIAL,
                              correoPersonalizado: true,
                            })
                          }
                        >
                          Enviar a un correo personalizado
                        </a>
                        {options.correoPersonalizado && (
                          <div className="flex gap-2">
                            <div className="flex justify-center items-center gap-2">
                              <label>
                                Correo: &nbsp;
                                <input
                                  className="border outline-none px-2"
                                  type="email"
                                  placeholder="Ingrese correo"
                                  value=""
                                  onChange={(e) => setNroWsp(e.target.value)}
                                />
                              </label>
                              <button className="border px-2 hover:bg-bordersAux">Enviar</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                  <a onClick={handleNewFactura}>Generar otra FACTURA</a>
                  <a onClick={() => setSuccess(false)}>Enviar otra BOLETA DE VENTA</a>
                  <a onClick={() => alert("ver cmoprobantes")}>Ver comprobantes</a>
                </div>
                {invoiceRegistered?.aceptada_sunat === "ERROR_CONTRIBUYENTE" ||
                  invoiceRegistered?.aceptada_sunat === "RECHAZADO" || (
                    <div className="w-full border py-3 px-5 flex justify-center items-center mt-2">
                      <Button variant="contained" color="error" fullWidth>
                        ANULAR o comunicar de baja
                      </Button>
                    </div>
                  )}

                {invoiceRegistered?.borrador ? (
                  <Alert icon={false} severity="error" className="text-center flex justify-center mt-2">
                    Guardado. Los borradores no se envian a sunat.
                  </Alert>
                ) : null}
                <div
                  className={`flex w-full border py-3 px-5 flex-col gap-2 mt-2 ${invoiceRegistered?.borrador || invoiceRegistered?.aceptada_sunat === "ERROR_CONTRIBUYENTE" ? "text-red-600" : "text-green-700"}`}
                >
                  <strong className="flex items-center">
                    Enviada a la SUNAT ?:&nbsp;
                    {invoiceRegistered?.aceptada_sunat === "ACEPTADO" ? (
                      <FaCheck />
                    ) : (statusInvoice?.sendMode === SendModeSunat.INMEDIATO && !invoiceRegistered?.borrador) ||
                      invoiceRegistered?.aceptada_sunat === "ERROR_EXCEPCION" ||
                      invoiceRegistered?.aceptada_sunat === "EN ESPERA" ||
                      invoiceRegistered?.aceptada_sunat === "ENVIANDO" ? (
                      <FaCloudUploadAlt />
                    ) : invoiceRegistered?.aceptada_sunat === "RECHAZADO" ? (
                      <FaCheck />
                    ) : (
                      <MdOutlineClose />
                    )}
                  </strong>
                  <strong className="flex items-center">
                    Aceptada por la SUNAT ?:&nbsp;
                    {invoiceRegistered?.aceptada_sunat === "ACEPTADO" ? (
                      <FaCheck />
                    ) : (statusInvoice?.sendMode === SendModeSunat.INMEDIATO && !invoiceRegistered?.borrador) ||
                      invoiceRegistered?.aceptada_sunat === "ERROR_EXCEPCION" ||
                      invoiceRegistered?.aceptada_sunat === "EN ESPERA" ||
                      invoiceRegistered?.aceptada_sunat === "ENVIANDO" ||
                      invoiceRegistered?.aceptada_sunat === "RECHAZADO" ? (
                      invoiceRegistered?.aceptada_sunat
                    ) : (
                      <MdOutlineClose />
                    )}
                  </strong>
                  <strong className="flex items-center">Código: {invoiceRegistered?.codigo_sunat}</strong>
                  <strong className="flex items-center">Descripción: {invoiceRegistered?.mensaje_sunat}</strong>
                  <strong className="flex items-center">Otros: {invoiceRegistered?.otros_sunat}</strong>
                </div>
              </DialogContent>
            </Dialog>
          )
        )}

        {userGlobal?.empresaActual?.modo === "DESARROLLO" && (
          <div className="px-3">
            {reconnecting && (
              <Alert severity="error">
                <strong>
                  Se produjo un error en el servidor. Estamos trabajando para solucionarlo. Por favor, inténtalo de
                  nuevo más tarde.
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
              errors={errors}
              control={control}
              open={isActiveModalObs}
              handleClose={handleCloseObservacion}
              agregarObservacion={agregarObservacion}
            />
          )}

          {isActiveModalProductos && (
            <ModalProductos
              watch={watch}
              trigger={trigger}
              control={control}
              setValue={setValue}
              open={isActiveModalProductos}
              handleClose={handleCloseProductos}
              agregarProducto={agregarProducto}
              actualizarProducto={actualizarProducto}
              getValues={getValues}
              errors={errors}
              setError={setError}
            />
          )}
          <form>
            {/* HEADER */}
            <div className="px-5 pt-[20px]">
              <Grid container spacing={2} columns={12}>
                <Grid container spacing={2} size={8}>
                  <Grid size={4}>
                    <div className="flex items-center justify-end">
                      <img
                        ref={imgRef}
                        className={`w-[130px] h-[130px] ${objectFit}`}
                        alt="Logo Empresa"
                        src={String(userGlobal?.empresaActual?.establecimiento?.logo)}
                      />
                    </div>
                  </Grid>
                  <Grid size={8}>
                    <div className="gap-2 flex flex-col justify-start items-start h-full">
                      <span className="text-[22px]">
                        <strong>{userGlobal?.empresaActual?.razon_social ?? "Razón social"}</strong>
                      </span>

                      <span className="text-[14px]">
                        {userGlobal?.empresaActual?.establecimiento?.direccion ?? "S/A"}
                      </span>

                      <span className="text-[14px]">
                        {String(userGlobal?.empresaActual?.establecimiento?.distrito ?? "-")}{" "}
                        {String(userGlobal?.empresaActual?.establecimiento?.provincia ?? "-")}{" "}
                        {String(userGlobal?.empresaActual?.establecimiento?.departamento ?? "-")}
                      </span>
                    </div>
                  </Grid>
                </Grid>

                <Grid size={4}>
                  <div className="text-[15px] gap-5 m-1 pt-4 pb-4 border border-dashed border-black flex flex-col justify-between items-center">
                    <div className="font-bold h-1/3 flex justify-center items-start">
                      <span>R.U.C. N° {userGlobal?.empresaActual?.ruc}</span>
                    </div>
                    <div className="font-bold h-1/3 flex justify-center items-start">
                      <span>FACTURA ELECTRÓNICA</span>
                    </div>
                    {CPE_SERIES.length > 0 ? (
                      <div className="h-1/3 flex items-center flex-row w-full justify-between px-4">
                        <select
                          {...register("serie", {
                            onChange: (e) => {
                              const value = e.target.value;
                              const serie = obtenerSerie(value);
                              setValue("numero", String(serie?.numero));
                              setValue("numeroConCeros", String(serie?.numeroConCeros));
                            },
                          })}
                          className="border w-5/12 h-full outline-none cursor-pointer px-[6px] py-[8px]"
                        >
                          {CPE_SERIES.map((item) => {
                            return (
                              <option key={item.id} disabled={!item.estado}>
                                {String(item.serie).toUpperCase()}
                              </option>
                            );
                          })}
                        </select>
                        <span className="w-2/12 flex justify-center items-center">-</span>
                        <label className="w-5/12 border h-full flex justify-center items-center px-[6px] py-[8px]">
                          {watch("numeroConCeros")}
                        </label>
                      </div>
                    ) : (
                      <div className="h-1/3 flex items-center flex-row w-full justify-center pr-4 pl-4 text-danger">
                        No tienes series asignadas
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>
            </div>
            {/* FIN HEADER */}

            {/* BODY */}
            <div className="flex flex-row p-2 gap-2 w-full">
              <div className="w-full">
                <div className="flex w-full p-1 gap-2 relative">
                  <div className="flex gap-1 relative">
                    <Controller
                      name="ruc"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          hiddenLabel
                          variant="filled"
                          autoComplete="off"
                          error={!!errors.ruc}
                          helperText={errors.ruc?.message}
                          inputProps={{ maxLength: 11 }}
                          placeholder="RUC"
                          onChange={(e) => {
                            field.onChange(e);
                            setValue("cliente", "");
                            setValue("direccion", "");
                            if (memoEntidades && memoEntidades?.length > 0) {
                              setOpenSearch(true);
                            }
                          }}
                          onClick={() => {
                            if ((dataEntidades && dataEntidades?.length > 0) || isLoadingEntidades) {
                              setOpenSearch(true);
                            }
                          }}
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={consultarRuc}
                      className="hover:border-blueAction border w-[32px] h-[32px]"
                    >
                      <SearchIcon className="text-borders" />
                    </button>
                    {isOpenSearch && memoEntidades.length > 0 && (
                      <>
                        <div className="absolute bg-white w-full z-[1] bottom-[-2px]" ref={rucSelect}>
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
                                      ruc === item.numero_documento ? "bg-primary text-white" : ""
                                    }`}
                                    onClick={async () => {
                                      setValue("ruc", item.numero_documento);
                                      setValue("cliente", item.entidad);
                                      setValue("direccion", item.direccion);
                                      setOpenSearch(false);
                                      await trigger();
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
                          error={!!errors.cliente}
                          helperText={errors.cliente?.message}
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
                        <InputText {...field} hiddenLabel variant="filled" placeholder="Dirección (opcional)" />
                      )}
                    />
                  </div>
                </div>

                <div className="flex w-full p-1 gap-32 justify-end">
                  <div className="flex w-auto">
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
                                setValue("fecha_vencimiento", undefined);
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

                  <div className="flex w-auto">
                    <label className="flex w-full whitespace-nowrap justify-center items-center">
                      F. de Vencimiento: &nbsp;
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
                              label: "0101 - Venta Interna (productos/servicios)",
                              value: "0101",
                            },
                          ].find(({ value }) => Number(value) === Number(field.value))}
                          options={[
                            {
                              label: "0101 - Venta Interna (productos/servicios)",
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
                          value={monedas.find(({ value }) => String(value) === String(field.value))}
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
            </div>
            {/* FIN BODY */}

            {/* TABLE */}
            <div className="flex flex-col px-4 gap-4 flex-1 justify-between">
              {/* ITEMS */}
              <div className="flex w-full flex-col">
                {fieldsProducts.length > 0 ? (
                  <>
                    <div className="flex w-full">
                      <table className="w-full">
                        <thead>
                          <tr className="border uppercase bg-bgDisabled text-[#3A3A3A]">
                            <th className="px-3 py-2 w-[80px]">Cant.</th>
                            <th className="px-3 py-2 w-[120px]">Codigo</th>
                            <th>Descripcion</th>
                            <th className="px-3 py-2 w-[140px]">P. Unit</th>
                            <th className="px-3 py-2 w-[140px]">Total</th>
                            <th></th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {operacionesProductos.items.map((item, i: number) => {
                            return (
                              <tr key={item.uuid}>
                                <td className="text-right w-[80px]">
                                  <div className={`border border-bordersAux ${i === 0 ? "mt-2 mb-1" : "my-1"} mr-2`}>
                                    <input
                                      className="w-[80px] px-3 py-2 text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.cantidad}
                                    />
                                  </div>
                                </td>
                                <td className="text-left">
                                  <div className={`border border-bordersAux ${i === 0 ? "mt-2 mb-1" : "my-1"} mr-2`}>
                                    <input
                                      className="w-[120px] px-3 py-2 text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.codigo}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className={`border border-bordersAux ${i === 0 ? "mt-2 mb-1" : "my-1"} mr-2`}>
                                    <input
                                      className="px-3 py-2 w-full text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.descripcion}
                                    />
                                  </div>
                                </td>
                                <td className="text-right">
                                  <div className={`border border-bordersAux ${i === 0 ? "mt-2 mb-1" : "my-1"} mr-2`}>
                                    <input
                                      className="w-[140px] px-3 py-2 text-right text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.mtoPrecioUnitario}
                                    />
                                  </div>
                                </td>
                                <td className="text-right">
                                  <div className={`border border-bordersAux ${i === 0 ? "mt-2 mb-1" : "my-1"} mr-2`}>
                                    <input
                                      className="w-[140px] px-3 py-2 text-right text-textDisabled text-shadow-disabled cursor-not-allowed"
                                      disabled
                                      value={item.mtoTotalItem}
                                    />
                                  </div>
                                </td>
                                <td className="text-center w-[30px]">
                                  <button
                                    type="button"
                                    className="bg-primary text-white p-2 rounded-md"
                                    onClick={() => {
                                      setValue("producto", {
                                        ...item,
                                        posicionTabla: Number(i),
                                      });
                                      setActiveModalProductos(true);
                                    }}
                                  >
                                    <FaEdit className="cursor-pointer text-[15px]" />
                                  </button>
                                </td>
                                <td className="text-center w-[30px]">
                                  <button
                                    type="button"
                                    className="bg-danger text-white p-2 rounded-md "
                                    onClick={() => eliminarProducto(i)}
                                  >
                                    <FaTrashAlt className="cursor-pointer text-[15px]" />
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
                        setValue("producto", FORM_MODAL_PRODUCT_INVOICE);
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
                      onClick={() => {
                        if (CPE_SERIES.length === 0) return;
                        setActiveModalProductos(true);
                      }}
                      sx={{ width: 64, height: 84 }}
                      className="text-borders cursor-pointer"
                    />
                    <ButtonSimple
                      disabled={CPE_SERIES.length === 0}
                      onClick={() => {
                        //clearErrors("producto");
                        setActiveModalProductos(true);
                        setValue("producto", FORM_MODAL_PRODUCT_INVOICE);
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
                      <div className="px-[5px] text-right block flex-[0_0_16%]">Ope. Gravada</div>
                      <div className="px-[5px]">
                        <input
                          className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                          disabled
                          placeholder="0.00"
                          value={operacionesProductos.operacion_gravada.toFixed(2)}
                        />
                      </div>
                    </div>
                    {operacionesProductos.operacion_exonerada > 0 && (
                      <>
                        <div className="flex justify-end w-full h-auto items-center">
                          <div className="px-[5px] text-right block flex-[0_0_16%]">Ope. Exonerada</div>
                          <div className="px-[5px]">
                            <input
                              className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                              disabled
                              placeholder="0.00"
                              value={operacionesProductos.operacion_exonerada.toFixed(2)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {operacionesProductos.operacion_inafecta > 0 && (
                      <>
                        <div className="flex justify-end w-full h-auto items-center">
                          <div className="px-[5px] text-right block flex-[0_0_16%]">Ope. Inafecta</div>
                          <div className="px-[5px]">
                            <input
                              className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                              disabled
                              placeholder="0.00"
                              value={operacionesProductos.operacion_inafecta.toFixed(2)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {operacionesProductos.operacion_gratuita > 0 && (
                      <>
                        <div className="flex justify-end w-full h-auto items-center">
                          <div className="px-[5px] text-right block flex-[0_0_16%]">Ope. Gratuita</div>
                          <div className="px-[5px]">
                            <input
                              className="w-[175px] text-right border p-[4px_8px] text-textDisabled text-shadow-disabled cursor-not-allowed"
                              disabled
                              placeholder="0.00"
                              value={operacionesProductos.operacion_gratuita.toFixed(2)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end w-full h-auto items-center">
                    <div className="px-[5px] text-right block flex-[0_0_16%]">IGV</div>
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
                    <div className="px-[5px] text-right block flex-[0_0_16%]">Importe Total</div>
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
                    <div className="px-[5px] text-right block">Forma de pago</div>
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
                            value={formaPagos.find(({ value }) => String(value) === String(field.value))}
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

                <Divider orientation="horizontal" sx={{ marginTop: 0.5, marginBottom: 0.5 }} />

                {/* CAJA IMPORTE EN LETRAS Y OBSERVACIONES */}
                <div className="flex flex-col flex-1">
                  {/* IMPORTE EN LETRAS  0.000118*/}
                  <div className="flex w-full border">
                    <span className="px-2 w-auto whitespace-nowrap">IMPORTE EN LETRAS</span>
                    <Divider orientation="vertical" />
                    <span className="px-2 bg-bgDisabled w-full text-textDisabled text-shadow-disabled cursor-not-allowed">
                      {numeroALetras(operacionesProductos.operacion_total)}
                    </span>
                  </div>

                  {/* OBSERVACIONES */}
                  <div className="flex flex-col">
                    {fieldsObs.map((obs, i) => {
                      return (
                        <div key={obs.uuid}>
                          <Divider orientation="horizontal" sx={{ marginTop: 0.5, marginBottom: 0.5 }} />
                          <div className="flex w-full">
                            <div className="border w-full bg-bgDisabled text-textDisabled text-shadow-disabled cursor-not-allowed">
                              <span className="px-2 w-auto">{obs.observacion}</span>
                            </div>
                            <div className="w-[60px] flex justify-center items-center">
                              <button type="button" onClick={() => removeObs(i)}>
                                <FaTrashAlt className="cursor-pointer" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTON AGREGAR OBSERVACIONES */}
                  <div className="flex w-full flex-col mt-[4px]">
                    <ButtonSimple
                      disabled={CPE_SERIES.length === 0}
                      onClick={() => {
                        setActiveModalObs(true);
                        setValue("observacion", "");
                      }}
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
                      disabled={!isValid || loading || CPE_SERIES.length === 0}
                      variant="contained"
                      color="secondary"
                      onClick={async () => await handleOpenConfirmDialog(true)}
                    >
                      {/* (e) =>
                        handleSubmit((data, event) =>
                          onSubmit(data, event, true)
                        )(e) */}
                      {isDraft && loading ? (
                        <span>
                          GUARDANDO BORRADOR... <CachedIcon className="animate-spin" />
                        </span>
                      ) : (
                        "GUARDAR COMO BORRADOR"
                      )}
                    </Button>
                  </div>
                  <div className="flex w-1/2">
                    <Button
                      fullWidth
                      disabled={!isValid || loading || CPE_SERIES.length === 0}
                      variant="contained"
                      color="primaryHover"
                      className="hover:bg-hoverPrimary"
                      onClick={async () => await handleOpenConfirmDialog(false)}
                    >
                      {!isDraft && loading ? (
                        <span>
                          Emitiendo factura... <CachedIcon className="animate-spin" />
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
