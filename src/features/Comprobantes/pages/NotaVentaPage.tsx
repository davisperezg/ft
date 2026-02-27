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
import { FaEdit } from "react-icons/fa";
import InputDate from "../../../components/Material/Input/InputDate";
import { getDniSunat, getRucSunat } from "../../../services/api/ext.service";
import { fixed, isError, round } from "../../../utils/functions.utils";
import { toast } from "sonner";
import { useMonedas } from "../../Monedas/hooks/useMoneda";
import { useEntidadesByEmpresa } from "../../Entidades/hooks/useEntidades";
import { useSocket } from "../../../hooks/useSocket";
import CachedIcon from "@mui/icons-material/Cached";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { PageEnum } from "../../../types/enums/page.enum";
import { IAuthEmpresa } from "../../../interfaces/models/auth/auth.interface";
import { useUserStore } from "../../../store/zustand/user-zustand";
import { usePageStore } from "../../../store/zustand/page-zustand";
import { usePaginationStore } from "../../../store/zustand/pagination-zustand";
import Grid from "@mui/material/Grid2";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  NotaVentaFormValues,
  NotaVentaProductTableState,
  NotaVentaRegisteredResponse,
  FORM_INITIAL_NOTA_VENTA,
  FORM_INITIAL_NOTA_VENTA_PRODUCT,
} from "../types/nota-venta.types";
import { schemaFormNotaVenta } from "../validations/nota-venta.schema";
import { StatusInvoice } from "../../../interfaces/components/invoices/status-invoices.interface";
import { DevTool } from "@hookform/devtools";
import ModalObservacion from "../components/NotaVenta/NotaVentaModalObservacion";
import ModalProductos from "../components/NotaVenta/NotaVentaModalProducto";

const STATUS_INITIAL: StatusInvoice = {
  codigo_estado: 0,
  nombre_estado: "GENERANDO",
  mensaje: "Generando documento...",
  invoiceId: 0,
  loading: false,
  codigo: "",
  otros: "",
  pdfA4: undefined,
};

const NotaVentaScreen = () => {
  const DECIMAL = 6;
  const userGlobal = useUserStore((state) => state.userGlobal);
  const setUserGlobal = useUserStore((state) => state.setUserGlobal);
  const setPage = usePageStore((state) => state.setPage);
  const page = usePageStore((state) => state.page);
  const setPagination = usePaginationStore((state) => state.setPagination);
  const [isActiveModalObs, setActiveModalObs] = useState(false);
  const [isActiveModalProductos, setActiveModalProductos] = useState(false);
  const [isOpenDateEmision, setIsOpenDateEmision] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openBackdrop, setBackdrop] = useState(false);
  const [confirmDialog, setConfigDialog] = useState(false);
  const [isDraft, setDraft] = useState(false);
  const [invoiceRegistered, setInvoiceRegistered] = useState<NotaVentaRegisteredResponse | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [objectFit, setObjectFit] = useState<"object-cover" | "object-fill">("object-cover");
  const [statusInvoice, setStatusInvoice] = useState<StatusInvoice | null>(STATUS_INITIAL || null);

  const handleCloseBackdrop = () => setBackdrop(false);
  const handleOpenBackdrop = (e: any) => {
    setBackdrop(true);
    handleSubmit((data) => onSubmit(data))(e);
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
    (doc) => String(doc.nombre).toUpperCase() === "NOTA DE VENTA"
  );

  const CPE_SERIES = useMemo(() => {
    return CPE?.series.filter((serie) => serie.estado) || [];
  }, [CPE]);

  const methods = useForm<NotaVentaFormValues>({
    defaultValues: {
      ...FORM_INITIAL_NOTA_VENTA,
      detalles: page.payload?.details || [],
      observaciones: page.payload?.observaciones || [],
    },
    values: page.payload || {
      ...FORM_INITIAL_NOTA_VENTA,
      serie: CPE_SERIES?.[0]?.serie || "",
      numero: CPE_SERIES?.[0]?.numero || "",
      numeroConCeros: CPE_SERIES?.[0]?.numeroConCeros || "",
    },
    resolver: yupResolver(schemaFormNotaVenta) as unknown as Resolver<NotaVentaFormValues>,
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
    name: "detalles",
    keyName: "uuid",
  });

  const eliminarProducto = (posicionTabla: number) => {
    removeProducts(posicionTabla);
  };

  const agregarProducto = () => {
    appendProducts(getValues("producto") ?? FORM_INITIAL_NOTA_VENTA_PRODUCT);
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
    updateProducts(posicionTabla, getValues("producto") ?? FORM_INITIAL_NOTA_VENTA_PRODUCT);
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
    (prev: NotaVentaProductTableState, curr) => {
      //gravada onerosaoperacionesProductos
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
          String(curr.tipAfeIgv)
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
  const tipoDocSelect = useRef<HTMLDivElement>(null);
  const numeroDocumento = watch("numeroDocumento");

  const memoEntidades = useMemo(() => {
    let result = dataEntidades ?? [];

    if (numeroDocumento.length > 0) {
      //filtrar por ruc
      result = dataEntidades?.filter((item) => item.numero_documento.toLowerCase().includes(numeroDocumento)) ?? [];
    }

    return result;
  }, [dataEntidades, numeroDocumento]);

  const consultarDocumento = async () => {
    const validRuc = await trigger("numeroDocumento");
    if (!validRuc) return;

    setOpenSearch(false);

    const numeroDocumento = getValues("numeroDocumento");
    const tipoEntidad = getValues("tipoEntidad");
    let entidad = null;

    try {
      if (tipoEntidad === "1") {
        entidad = await getDniSunat(numeroDocumento);
      } else {
        entidad = await getRucSunat(numeroDocumento);
      }

      if (!entidad.lista) {
        toast.error(entidad.error);
        setValue("nombreCliente", "");
        return;
      }

      if (tipoEntidad === "1") {
        const { nombresapellidos } = entidad.lista[0];
        setValue("nombreCliente", String(nombresapellidos).toUpperCase().trim());
      } else {
        const { apenomdenunciado } = entidad.lista[0];
        const razonSocial = String(apenomdenunciado).toUpperCase().trim();
        setValue("nombreCliente", razonSocial);
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
      const abreviado = item.abreviado.charAt(0).toUpperCase() + item.abreviado.slice(1);
      return {
        label: `${item.abrstandar} - (${item.simbolo}) ${abreviado}`,
        value: item.abrstandar,
      };
    }) ?? [];

  const { socket, reconnecting } = useSocket("nota-ventas");

  const handleNewFactura = () => {
    setSuccess(false);
    setStatusInvoice(STATUS_INITIAL);
    setInvoiceRegistered(null);
  };

  const onSubmit = async (values: NotaVentaFormValues) => {
    setLoading(true);

    const fechaEmision = dayjs(values.fechaEmision).toDate();

    const data: NotaVentaFormValues = {
      tipoDocumento: values.tipoDocumento,
      serie: values.serie,
      numero: values.numero,
      tipoEntidad: values.tipoEntidad,
      numeroDocumento: values.numeroDocumento,
      nombreCliente: values.nombreCliente,
      fechaEmision,
      moneda: values.moneda,
      detalles: values.detalles,
      observaciones: [],
      empresa: Number(userGlobal?.empresaActual?.id),
      establecimiento: Number(userGlobal?.empresaActual?.establecimiento?.id),
      id: values.id,
      pos: Number(userGlobal?.empresaActual?.establecimiento?.pos?.id),
    };

    socket?.volatile.emit("client::newNotaVenta", data);
  };

  const handleIdNotaVenta = useCallback(
    (data: any) => {
      switch (data.estado) {
        case "success": {
          setInvoiceRegistered(data);
          setSuccess(true);

          //Reiniciamos valores por defecto excepto la serie y correlativos
          setPage({
            namePage: PageEnum.SCREEN_CREATE_NOTA_VENTA,
            open: true,
            pageComplete: false,
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

  const handleStatusNotaVenta = useCallback((data: StatusInvoice) => {
    setStatusInvoice(data);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      // Verificar si el clic fue fuera del componente
      if (tipoDocSelect.current && !tipoDocSelect.current.contains(event.target)) {
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
      socket.on("server::getIdNotaVenta", handleIdNotaVenta);
      socket.on("server::statusNotaVenta", handleStatusNotaVenta);

      socket.on("exception", (data: any) => {
        toast.error(data.message);
        setLoading(false);
      });

      return () => {
        socket.off("error");
        socket.off("server::getIdNotaVenta", handleIdNotaVenta);
        socket.off("server::statusNotaVenta", handleStatusNotaVenta);
        socket.off("exception");
      };
    }
  }, [handleIdNotaVenta, socket, handleStatusNotaVenta]);

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
      <DevTool control={control} />
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
                <Alert icon={false} severity={"success"} className="text-center flex justify-center">
                  Generado con éxito.
                </Alert>
              </DialogTitle>
              <DialogContent>
                <h3 className="flex justify-center items-center text-[24px] mt-2">{invoiceRegistered?.documento}</h3>
                <h4 className="flex justify-center items-center text-[24px]">
                  {invoiceRegistered?.serie}-{invoiceRegistered?.correlativo_registrado}
                </h4>
                <h4 className="flex justify-center items-center text-[24px]">TOTAL: {invoiceRegistered?.total}</h4>
                <div className="w-full border py-3 px-5 flex justify-center items-center mt-2 flex-col gap-2">
                  <Button
                    className="hover:text-white"
                    component="a"
                    target="_blank"
                    href={invoiceRegistered?.pdf58mm}
                    rel="noopener noreferrer"
                    variant="contained"
                    color="primary"
                  >
                    PDF TICKET 58mm
                  </Button>

                  <Button
                    className="hover:text-white"
                    component="a"
                    target="_blank"
                    href={invoiceRegistered?.pdf80mm}
                    rel="noopener noreferrer"
                    variant="contained"
                    color="primary"
                  >
                    PDF TICKET 80mm
                  </Button>
                </div>

                <div className="w-full border py-3 px-5 gap-2 flex flex-col justify-center items-center mt-2 cursor-pointer">
                  <a onClick={handleNewFactura}>Generar otra Nota de Venta</a>
                  <a
                    onClick={() => {
                      setPagination({ pageIndex: 0, pageSize: 10 });
                      setPage({
                        namePage: PageEnum.SCREEN_LIST_INVOICE,
                        open: true,
                        pageComplete: false,
                        payload: null,
                      });
                    }}
                  >
                    Ver comprobantes
                  </a>
                </div>
                <div className="w-full border py-3 px-5 flex justify-center items-center mt-2">
                  <Button variant="contained" color="error" fullWidth>
                    ANULAR
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )
        )}

        <div className="px-3 pt-3">
          {reconnecting && (
            <Alert severity="error">
              <strong>
                Se produjo un error en el servidor. Estamos trabajando para solucionarlo. Por favor, inténtalo de nuevo
                más tarde.
              </strong>
            </Alert>
          )}
        </div>

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
                      <span>NOTA DE VENTA</span>
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
                  <div className="w-1/2">
                    <Controller
                      name="nombreCliente"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          hiddenLabel
                          variant="filled"
                          placeholder="Cliente (opcional)"
                          error={!!errors.nombreCliente}
                          helperText={errors.nombreCliente?.message}
                        />
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <div className="w-full flex flex-row gap-2">
                      <Controller
                        name="tipoEntidad"
                        control={control}
                        render={({ field }) => (
                          <SelectSimple
                            {...field}
                            className="tipoEntidad-single"
                            classNamePrefix="select"
                            placeholder="Tipo de documento"
                            isSearchable={false}
                            value={[
                              {
                                label: "DNI",
                                value: "1",
                              },
                              {
                                label: "RUC",
                                value: "6",
                              },
                            ].find(({ value }) => String(value) === String(field.value))}
                            options={[
                              {
                                label: "DNI",
                                value: "1",
                              },
                              {
                                label: "RUC",
                                value: "6",
                              },
                            ]}
                            onChange={(e: any) => {
                              field.onChange(e.value);
                              setValue("nombreCliente", "");
                              trigger("numeroDocumento");
                            }}
                          />
                        )}
                      />

                      <div className="w-full flex gap-2 relative">
                        <Controller
                          name="numeroDocumento"
                          control={control}
                          render={({ field }) => (
                            <InputText
                              {...field}
                              hiddenLabel
                              variant="filled"
                              autoComplete="off"
                              error={!!errors.numeroDocumento}
                              helperText={errors.numeroDocumento?.message}
                              inputProps={{ maxLength: 11 }}
                              placeholder="Numero de documento (opcional)"
                              onChange={(e) => {
                                field.onChange(e);
                                setValue("nombreCliente", "");
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
                          onClick={consultarDocumento}
                          className="hover:border-blueAction border w-[32px] h-[32px]"
                        >
                          <SearchIcon className="text-borders" />
                        </button>
                        {isOpenSearch && memoEntidades.length > 0 && (
                          <>
                            <div className="absolute bg-white w-full z-[1] bottom-[-2px]" ref={tipoDocSelect}>
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
                                          numeroDocumento === item.numero_documento ? "bg-primary text-white" : ""
                                        }`}
                                        onClick={async () => {
                                          if (item.numero_documento.length === 11) {
                                            setValue("tipoEntidad", "6");
                                          } else {
                                            setValue("tipoEntidad", "1");
                                          }
                                          setValue("numeroDocumento", item.numero_documento);
                                          setValue("nombreCliente", item.entidad);
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
                    </div>
                  </div>
                </div>

                <div className="flex w-full p-1 gap-32 justify-end">
                  <div className="flex w-auto">
                    <label className="flex w-full whitespace-nowrap justify-center items-center">
                      F. de Emisión: &nbsp;
                      <Controller
                        name="fechaEmision"
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
                        setValue("producto", FORM_INITIAL_NOTA_VENTA_PRODUCT);
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
                        setValue("producto", FORM_INITIAL_NOTA_VENTA_PRODUCT);
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
                </div>

                <Divider orientation="horizontal" sx={{ marginTop: 0.5, marginBottom: 0.5 }} />

                {/* CAJA IMPORTE EN LETRAS Y OBSERVACIONES */}
                <div className="flex flex-col flex-1">
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
                  <div className="flex w-1/5"></div>
                  <div className="flex w-1/5"></div>
                  <div className="flex w-1/5"></div>
                  <div className="flex w-1/5"></div>
                  <div className="flex w-1/5">
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
                          Emitiendo Nota de Venta... <CachedIcon className="animate-spin" />
                        </span>
                      ) : (
                        "Emitir Nota de Venta"
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

export default NotaVentaScreen;
