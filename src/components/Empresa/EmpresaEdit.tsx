import {
  SubmitHandler,
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import { IEmpresa } from "../../interface/empresa.interface";
import { useContext, useState, useRef } from "react";
import { ModalContext } from "../../context/modalContext";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import DialogBasic from "../Dialog/DialogBasic";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import TabModal from "../Tab/Modal/TabModal";
import TabModalItem from "../Tab/Modal/TabModalItem";
import TabModalPanel from "../Tab/Modal/TabModalPanel";
import {
  useEmpresa,
  usePostEmpresa,
  useUsersEmpresa,
} from "../../hooks/useEmpresa";
import { useTipoDocs } from "../../hooks/useTipoDocs";
import { IUser } from "../../interface/user.interface";
import { FcSearch } from "react-icons/fc";
import {
  useDepartamentos,
  useDistritos,
  useDistritosDinamic,
  useProvincias,
  useProvinciasDinamic,
} from "../../hooks/useEntidades";
import { SelectSimple } from "../Select/SelectSimple";
import { useQueryClient } from "@tanstack/react-query";
import { IDistrito, IProvincia } from "../../interface/entidades.interface";
import { DevTool } from "@hookform/devtools";

interface Props {
  data: IEmpresa;
  closeEdit: () => void;
}

interface Option {
  label: string;
  value: string;
}


const EmpresaEdit = ({ data, closeEdit }: Props) => {
  
  const queryClient = useQueryClient();
  const { dispatch } = useContext(ModalContext);
  const [value, setValue] = useState(1);
  const { isLoading: isLoadingGet, data: dataGetEmpresa } = useEmpresa(61);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue: setValueModel,
    getValues,
    control,
  } = useForm<IEmpresa>({
    values: dataGetEmpresa
      ? {
          ...dataGetEmpresa,
          usuario: Number((dataGetEmpresa.usuario as IUser).id),
          establecimientos: [],
        }
      : undefined,
  });

  const { watch: watchAny, setValue: setValueAny } = useForm<any>({
    values: {
      index: 0,
    },
  });

  const { isLoading: isLoadingDepartamentos, data: dataDepartamentos } =
    useDepartamentos();

  // const { isLoading: isLoadingDistritos, data: dataDistritos } =
  //   useDistritosDinamic(watch("provincia")?.value, watch("provincia")?.value);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documentos",
  });

  const {
    fields: fieldsEstablecimientos,
    append: appendEstablecimiento,
    remove: removeEstablecimiento,
  } = useFieldArray({
    control,
    name: "establecimientos",
  });

  const { isLoading: isLoadingProvincias } = useProvinciasDinamic(
    watchAny("index"),
    watch("establecimientos")?.[watchAny("index")]?.departamento.value
  );

  const { isLoading: isLoadingDistritos } = useDistritosDinamic(
    watchAny("index"),
    watch("establecimientos")?.[watchAny("index")]?.provincia.value
  );

  const {
    data: dataTipdocs,
    error: errorTipdocs,
    isLoading: isLoadingTipdocs,
    isError: isErrorTipdocs,
  } = useTipoDocs();

  const {
    data: dataUsers,
    isLoading: isLoadingUsers,
    error: errorUsers,
    isError: isErrorUsers,
  } = useUsersEmpresa();

  const [loadingChange, setLoadingChange] = useState<boolean>(false);

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
    //Eliminamos litado de provincias y distritos de la cache
    watch("establecimientos")?.map((est, idx) => {
      const provincias = [`provincias_${idx}`, est.departamento.value];
      const distritos = [`distritos_${idx}`, est.provincia.value];
      const provinciasEmptys = [`provincias_${idx}`, ""];
      const distritosEmptys = [`distritos_${idx}`, ""];
      queryClient.removeQueries({ queryKey: provincias, exact: true });
      queryClient.removeQueries({ queryKey: distritos, exact: true });
      queryClient.removeQueries({ queryKey: provinciasEmptys, exact: true });
      queryClient.removeQueries({ queryKey: distritosEmptys, exact: true });
    });
  };

  const certRef = useRef<HTMLInputElement | null>(null);
  const refLogo = useRef<HTMLInputElement | null>(null);

  const { ref: refCert, ...cert } = register("cert", {
    required: {
      value: watch("modo") === 1 && !watch("cert") ? true : false,
      message: "Suba un certificado .pfx | .p12",
    },
    onChange: (e) => {
      const files = e.target.files as FileList;
      if (files.length > 0 && files[0].type !== "application/x-pkcs12") {
        alert("Por favor, selecciona un archivo PKCS12.");
        setValueModel("cert", null);
      }
    },
  });

  const { ref: refLogoForm, ...logo } = register("logo", {
    onChange: (e) => {
      const files = e.target.files as FileList;
      if (files.length > 0 && files[0].type !== "image/png") {
        alert("Por favor, selecciona un archivo PNG.");
        setValueModel("logo", null);
      }
    },
  });

  const handleBrowseCertButtonClick = () => certRef?.current?.click();

  const handleBrowseLogoButtonClick = () => refLogo?.current?.click();

  const handleTab = (newValue: number) => setValue(newValue);

  const { mutateAsync: mutateEmpresaAsync, isLoading: isLoadingEmpresa } =
    usePostEmpresa();

  const onSubmit: SubmitHandler<IEmpresa> = async (values) => {
    const getDataLogo = dataGetEmpresa?.logo?.[0].name;
    const getDataCert = dataGetEmpresa?.cert?.[0].name;

    const { logo, cert } = values;
    const inputLogo = logo?.[0].name;
    const inputCert = cert?.[0].name;

    const formData = new FormData();
    try {
      if (logo && logo?.length > 0 && inputLogo !== getDataLogo) {
        console.log("el logo es diferente por lo tanto se agrega");
        formData.append("logo", logo[0]);
      }

      console.log("inputCert", inputCert);
      console.log("getDataCert", getDataCert);
      if (cert && cert?.length > 0 && inputCert !== getDataCert) {
        console.log("el certificado es diferente por lo tanto se agrega");
        formData.append("certificado", cert[0]);
      }

      formData.append("data", JSON.stringify(values));
      const res = await mutateEmpresaAsync(formData);
      toast.success(res.message);
      dispatch({ type: "INIT" });
      //   const response = await mutateTipoDoc({
      //     body: values,
      //     id: data.id as number,
      //   });

      //   toast.success(response.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
  };

  console.log(watch());
  const listEntidad = (index: number, padre: string) => {
    switch (padre) {
      case "PROVINCIAS": {
        const list = queryClient.getQueryData([
          `provincias_${index}`,
          watch("establecimientos")?.[index]?.departamento.value,
        ]) as IProvincia[];

        return list?.map((item) => {
          return {
            value: item.id,
            label: item.id + " - " + item.provincia,
          };
        });
      }
      case "DISTRITOS": {
        const list = queryClient.getQueryData([
          `distritos_${index}`,
          watch("establecimientos")?.[index]?.provincia.value,
        ]) as IDistrito[];

        return list?.map((item) => {
          return {
            value: item.id,
            label: item.id + " - " + item.distrito,
          };
        });
      }

      default: {
        return [];
      }
    }
  };

  const listDepartamentos =
    dataDepartamentos?.map((item) => ({
      value: item.id,
      label: `${item.id} - ${item.departamento}`,
    })) || [];

  const onChangeEntidad = async (
    entidad: string,
    field: any,
    index: number,
    event: any
  ) => {
    setLoadingChange(true);
    field.onChange(event);
    setValueAny("index", index);

    switch (entidad) {
      case "DEPARTAMENTO": {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        //Obtenemos provincia
        const findLabelProvincia = listEntidad(index, "PROVINCIAS")?.find(
          (item) => item.value === `${event.value}01`
        );

        setValueModel(`establecimientos.${index}.provincia`, {
          label: findLabelProvincia?.label || "",
          value: `${event.value}01`,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        //Obtenemos disitrito
        const findLabelDistrito = listEntidad(index, "DISTRITOS")?.find(
          (item) => item.value === `${event.value}0101`
        );

        setValueModel(`establecimientos.${index}.distrito`, {
          label: findLabelDistrito?.label || "",
          value: `${event.value}0101`,
        });

        setValueModel(`establecimientos.${index}.ubigeo`, `${event.value}0101`);

        break;
      }

      case "PROVINCIA": {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        //Obtenemos distrito
        const findLabel = listEntidad(index, "DISTRITOS")?.find(
          (item) => item.value === `${event.value}01`
        );

        setValueModel(`establecimientos.${index}.distrito`, {
          label: findLabel?.label || "",
          value: `${event.value}01`,
        });

        setValueModel(`establecimientos.${index}.ubigeo`, `${event.value}01`);

        break;
      }

      case "DISTRITO": {
        setValueModel(`establecimientos.${index}.ubigeo`, `${event.value}`);

        break;
      }
    }

    setLoadingChange(false);
  };

  return (
    <>
      <DialogBasic width={855} height={652} handleClose={closeModal}>
        <DialogTitle>{`Editar ${data.razon_social}`}</DialogTitle>
        <DialogBody>
          <TabModal value={value} onChange={handleTab}>
            <TabModalItem value={1}>General</TabModalItem>
            <TabModalItem value={2}>Configuraciones</TabModalItem>
            <TabModalItem value={3}>Documentos</TabModalItem>
            <TabModalItem value={4}>Contacto</TabModalItem>
            <TabModalItem value={5}>Establecimientos</TabModalItem>
          </TabModal>

          <form className="overflow-y-auto flex-[1_0_calc(100%-78px)]">
            <TabModalPanel value={value} index={1}>
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Usuario: <strong className="text-primary">*</strong>
                  </label>
                </div>

                <div className="w-1/3">
                  <select
                    {...register("usuario", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Seleccione un usuario.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors.usuario || isErrorUsers ? "border-primary" : ""
                    }`}
                  >
                    <option value={-1}>[SELECCIONE UN USUARIO]</option>
                    {isLoadingUsers ? (
                      <option>Cargando...</option>
                    ) : (
                      dataUsers?.map((a) => {
                        return (
                          <option key={a.id} value={a.id}>
                            {a.nombreCompleto} - {a.usuario} - {a.correo}
                          </option>
                        );
                      })
                    )}
                  </select>
                  {errors.usuario && (
                    <span className="text-primary">
                      {errors.usuario.message}
                    </span>
                  )}
                  {isErrorUsers && (
                    <span className="text-primary">
                      {errorUsers.response.data.message}
                    </span>
                  )}
                </div>
              </div>
              {/* RUC */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Ruc:</label>
                </div>
                <div className="w-1/3 flex">
                  {/* overflow-hidden relative flex */}
                  <div className="w-2/3">
                    <input
                      {...register(`ruc`, {
                        required: {
                          value: true,
                          message: "Ingrese RUC.",
                        },
                        pattern: {
                          value: /^(20|10)\d{9}$/,
                          message: "El RUC debe ser válido.",
                        },
                        maxLength: {
                          value: 11,
                          message: "El RUC debe contener 11 caracteres.",
                        },
                        minLength: {
                          value: 11,
                          message: "El RUC debe contener 11 caracteres.",
                        },

                        onChange: (e) => {
                          const value: string = e.target.value;
                          const maxLength = value.slice(0, 11);
                          if (value.length > 11) {
                            return setValueModel("ruc", maxLength);
                          }

                          if (value.length !== 11) {
                            setValueModel("razon_social", "");
                            setValueModel("nombre_comercial", "");
                            setValueModel("domicilio_fiscal", "");
                            setValueModel("ubigeo", "");
                            //setValueModel("urbanizacion", "");
                          }
                        },
                      })}
                      className={`border w-full focus:outline-none pl-1 rounded-sm ${
                        errors?.ruc ? "border-primary" : ""
                      }`}
                      type="text"
                      disabled={true}
                    />
                    {errors?.ruc && (
                      <span className="text-primary">
                        {errors?.ruc.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        toast.error("Ingrese ruc");
                      }}
                      className="flex items-center justify-center h-[20px] hover:bg-hover text-center bg-default w-full"
                    >
                      {true ? "..." : <FcSearch />}
                    </button>
                  </div>
                </div>
              </div>

              {/* EMPRESA */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Empresa:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`razon_social`, {
                      required: {
                        value: true,
                        message: "Ingrese razon social.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.razon_social ? "border-primary" : ""
                    }`}
                  />
                  {errors?.razon_social && (
                    <span className="text-primary">
                      {errors?.razon_social?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* NOMBRE COMERCIAL */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Nombre comercial:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`nombre_comercial`, {
                      required: {
                        value: true,
                        message: "Ingrese nombre comercial.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.nombre_comercial ? "border-primary" : ""
                    }`}
                  />
                  {errors?.nombre_comercial && (
                    <span className="text-primary">
                      {errors?.nombre_comercial?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* DOMICILIO FISCAL */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Domicilio fiscal:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`domicilio_fiscal`, {
                      required: {
                        value: true,
                        message: "Ingrese domicilio fiscal.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.domicilio_fiscal ? "border-primary" : ""
                    }`}
                  />
                  {errors?.domicilio_fiscal && (
                    <span className="text-primary">
                      {errors?.domicilio_fiscal?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* LOGO */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Logo:</label>
                </div>
                <div className="w-2/3">
                  <input
                    {...logo}
                    type="file"
                    accept=".png"
                    name="logo"
                    ref={(e) => {
                      refLogoForm(e);
                      refLogo.current = e;
                    }}
                    className={`hidden text-[12px] ${
                      errors?.logo ? "border-primary" : ""
                    }`}
                  />
                  <input
                    className="border border-black bg-hover px-2 cursor-pointer"
                    type="button"
                    value="Buscar logo"
                    onClick={handleBrowseLogoButtonClick}
                  />
                  <label>
                    &nbsp;
                    {String(
                      (watch("logo")?.[0] as any)?.name ??
                        "Ningún archivo seleccionado."
                    )}
                  </label>
                  {errors?.logo && (
                    <span className="text-primary">
                      {errors?.logo?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* SUNAT */}
              {/* UBIGEO */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Ubigeo:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`ubigeo`, {
                      required: {
                        value: true,
                        message:
                          'Ingrese el ubigeo. Por defecto puede ingresar "-" sin comillas',
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.ubigeo ? "border-primary" : ""
                    }`}
                  />
                  {errors?.ubigeo && (
                    <span className="text-primary">
                      {errors?.ubigeo?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* URBANIZACION */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Urbanizacion:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`urbanizacion`, {
                      required: {
                        value: true,
                        message:
                          'Ingrese urbanizacion. Por defecto puede ingresar "-" sin comillas',
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.urbanizacion ? "border-primary" : ""
                    }`}
                  />
                  {errors?.urbanizacion && (
                    <span className="text-primary">
                      {errors?.urbanizacion?.message}
                    </span>
                  )}
                </div>
              </div>
            </TabModalPanel>

            <TabModalPanel value={value} index={2}>
              {/* CONFIGURACIONES */}

              {/* MODO 0 beta - 1 produccion */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Modo: <strong className="text-primary">*</strong>
                  </label>
                </div>
                <div className="w-1/3">
                  <select
                    {...register(`modo`, {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Ingrese Modo.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.modo ? "border-primary" : ""
                    }`}
                  >
                    <option value={0}>Beta</option>
                    <option value={1}>Produccion</option>
                  </select>

                  {errors?.modo && (
                    <span className="text-primary">
                      {errors?.modo?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* SI ES MODO BETA SE DESACTIVA INPUTS */}

              {/* HABILITAR OSE */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Habilitar OSE: <strong className="text-primary"></strong>
                  </label>
                </div>
                <div className="w-1/3">
                  <input
                    type="checkbox"
                    {...register(`ose_enabled`)}
                    className={`text-[12px] ${
                      errors?.ose_enabled ? "border-primary" : ""
                    }`}
                  />
                </div>
              </div>

              {/* SI HABILITAMOS OSE SE DEBE HABILITAR TAMBIEN EL LINK DEL OSE */}
              {Boolean(watch("ose_enabled") === true) && (
                <div className="w-full flex flex-row mt-3">
                  <div className="w-1/3">
                    <label>
                      Link OSE: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <input
                      type="text"
                      {...register(`web_service`, {
                        pattern: {
                          value: /^(http|https):\/\/[\w\-\.]+\.\w{2,}(\/.*)?$/,
                          message: "El link del web_service debe ser valido.",
                        },
                        required: {
                          value: watch("ose_enabled") === true ? true : false,
                          message: "Ingrese link OSE.",
                        },
                      })}
                      className={`border w-full focus:outline-none pl-1 rounded-sm text-[12px] ${
                        errors?.web_service ? "border-primary" : ""
                      }`}
                    />

                    {errors?.web_service && (
                      <span className="text-primary">
                        {errors?.web_service?.message}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {Number(watch("modo")) === 1 && (
                <>
                  {/* CERTIFICADO */}
                  <div className="w-full flex flex-row mt-3">
                    <div className="w-1/3">
                      <label>
                        Certificado: <strong className="text-primary">*</strong>
                      </label>
                    </div>
                    <div className="w-2/3 ">
                      <input
                        {...cert}
                        type="file"
                        accept=".pfx;*.p12"
                        name="cert"
                        ref={(e) => {
                          console.log(e);
                          refCert(e);
                          certRef.current = e;
                        }}
                        className={`hidden text-[12px] ${
                          errors?.cert ? "border-primary" : ""
                        }`}
                      />

                      <div>
                        <input
                          className={`border ${
                            errors?.cert ? "border-primary" : "border-black"
                          } bg-hover px-2 cursor-pointer`}
                          type="button"
                          value="Buscar certificado"
                          onClick={handleBrowseCertButtonClick}
                        />
                        <label>
                          &nbsp;
                          {String(
                            (watch("cert")?.[0] as any)?.name ??
                              "Ningún archivo seleccionado."
                          )}
                        </label>
                      </div>
                      {errors?.cert && (
                        <span className="text-primary">
                          {errors?.cert?.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CERTIFICADO PASSWORD */}
                  <div className="w-full flex flex-row mt-3">
                    <div className="w-1/3">
                      <label>
                        Cert. password:{" "}
                        <strong className="text-primary">*</strong>
                      </label>
                    </div>
                    <div className="w-1/3">
                      <input
                        {...register(`cert_password`, {
                          required: {
                            value:
                              watch("modo") === 1 || watch("cert")
                                ? true
                                : false,
                            message:
                              watch("modo") === 1 && !watch("cert")
                                ? "Suba un cert. para agregar el password"
                                : "Ingrese password del certificado.",
                          },
                        })}
                        className={`border w-full focus:outline-none pl-1 rounded-sm ${
                          errors?.cert_password ? "border-primary" : ""
                        }`}
                      />
                      {errors?.cert_password && (
                        <span className="text-primary">
                          {errors?.cert_password?.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {watch("ose_enabled") ? (
                    <>
                      {/* OSE USUSEC */}
                      <div className="w-full flex flex-row mt-3">
                        <div className="w-1/3">
                          <label>
                            Usuario secundario username OSE:{" "}
                            <strong className="text-primary">*</strong>
                          </label>
                        </div>
                        <div className="w-1/3">
                          <input
                            {...register(`usu_secundario_ose_user`, {
                              required: {
                                value:
                                  watch("ose_enabled") === true ? true : false,
                                message: "Ingrese usuario secundario OSE",
                              },
                            })}
                            className={`border w-full focus:outline-none pl-1 rounded-sm ${
                              errors?.usu_secundario_ose_user
                                ? "border-primary"
                                : ""
                            }`}
                          />
                          {errors?.usu_secundario_ose_user && (
                            <span className="text-primary">
                              {errors?.usu_secundario_ose_user?.message}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* OSE USUSECPASSWORD */}
                      <div className="w-full flex flex-row mt-3">
                        <div className="w-1/3">
                          <label>
                            Usuario secundario password OSE:{" "}
                            <strong className="text-primary">*</strong>
                          </label>
                        </div>
                        <div className="w-1/3">
                          <input
                            {...register(`usu_secundario_ose_password`, {
                              required: {
                                value:
                                  watch("ose_enabled") === true ? true : false,
                                message:
                                  "Ingrese password del usuario secundario OSE",
                              },
                            })}
                            className={`border w-full focus:outline-none pl-1 rounded-sm ${
                              errors?.usu_secundario_ose_password
                                ? "border-primary"
                                : ""
                            }`}
                          />
                          {errors?.usu_secundario_ose_password && (
                            <span className="text-primary">
                              {errors?.usu_secundario_ose_password?.message}
                            </span>
                          )}
                        </div>
                      </div>{" "}
                    </>
                  ) : (
                    <>
                      {/* SUNAT USUSECUSERNAME */}
                      <div className="w-full flex flex-row mt-3">
                        <div className="w-1/3">
                          <label>
                            Usuario secundario username:{" "}
                            <strong className="text-primary">*</strong>
                          </label>
                        </div>
                        <div className="w-1/3">
                          <input
                            {...register(`usu_secundario_user`, {
                              required: {
                                value:
                                  watch("ose_enabled") === false ? true : false,
                                message: "Ingrese usuario secundario",
                              },
                            })}
                            className={`border w-full focus:outline-none pl-1 rounded-sm ${
                              errors?.usu_secundario_user
                                ? "border-primary"
                                : ""
                            }`}
                          />
                          {errors?.usu_secundario_user && (
                            <span className="text-primary">
                              {errors?.usu_secundario_user?.message}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SUNAT USUSECPASSWORD */}
                      <div className="w-full flex flex-row mt-3">
                        <div className="w-1/3">
                          <label>
                            Usuario secundario password:{" "}
                            <strong className="text-primary">*</strong>
                          </label>
                        </div>
                        <div className="w-1/3">
                          <input
                            {...register(`usu_secundario_password`, {
                              required: {
                                value:
                                  watch("ose_enabled") === false ? true : false,
                                message:
                                  "Ingrese password del usuario secundario",
                              },
                            })}
                            className={`border w-full focus:outline-none pl-1 rounded-sm ${
                              errors?.usu_secundario_password
                                ? "border-primary"
                                : ""
                            }`}
                          />
                          {errors?.usu_secundario_password && (
                            <span className="text-primary">
                              {errors?.usu_secundario_password?.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </TabModalPanel>

            <TabModalPanel value={value} index={3}>
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Tipo de documento:</label>
                </div>
                <div className="w-1/3">
                  <select
                    {...register("tip_documento", {
                      valueAsNumber: true,
                      value: -1,
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors.tip_documento || isErrorTipdocs
                        ? "border-primary"
                        : ""
                    }`}
                  >
                    <option value={-1}>
                      [SELECCIONE UN TIPO DE DOCUMENTO]
                    </option>
                    {isLoadingTipdocs ? (
                      <option>Cargando...</option>
                    ) : (
                      dataTipdocs?.map((a) => {
                        return (
                          <option
                            disabled={a.status ? false : true}
                            key={a.id}
                            value={a.id}
                          >
                            {a.nombre} - {a.codigo}
                          </option>
                        );
                      })
                    )}
                  </select>
                  {errors.tip_documento && (
                    <span className="text-primary">
                      {errors.tip_documento.message}
                    </span>
                  )}
                  {errorTipdocs && (
                    <span className="text-primary">
                      {errorTipdocs.response.data.message}
                    </span>
                  )}
                </div>
                <div className="w-1/3 flex justify-end">
                  <button
                    type="button"
                    className="flex items-center justify-center h-[20px] hover:bg-hover text-center bg-default w-1/3"
                    onClick={() => {
                      const documento = dataTipdocs
                        ?.map((tip) => ({
                          id: tip.id,
                          nombre: tip.nombre,
                          idTipo: tip.id || 0,
                        }))
                        .find((item) => item.idTipo === watch("tip_documento"));

                      //Si encuentra un documento agregamos
                      if (documento) {
                        //Evitar agregar duplicado
                        const docFound = fields.some(
                          (item) =>
                            item.nombre.toLowerCase() ===
                            documento.nombre.toLowerCase()
                        );

                        if (docFound) {
                          alert("El documento ya esta agregado.");
                          return;
                        }

                        return append(documento);
                      }

                      alert("Seleccione un tipo de documento para agregar.");
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {fields.length > 0 && (
                <>
                  <div className="w-full flex flex-row mt-10">
                    <strong>Documentos asignados:</strong>
                  </div>
                  <div className="w-full flex flex-col">
                    {fields.map((item, index) => {
                      return (
                        <div
                          key={index + 1}
                          className={`w-full flex gap-1 ${
                            index === 0 ? "mt-3 py-1" : "py-1"
                          } border-t`}
                        >
                          <div className="w-1/12 flex justify-center items-center">
                            <strong>{index + 1}</strong>
                          </div>
                          <div className="w-8/12 flex justify-center items-center">
                            {item.nombre}
                          </div>
                          <div className="w-3/12 flex">
                            <button
                              type="button"
                              className="w-full h-8 border border-primary text-primary"
                              onClick={() => remove(index)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </TabModalPanel>

            <TabModalPanel value={value} index={4}>
              {/* CONTACTOS */}
              {/* CORREO */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Correo:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`correo`, {
                      required: {
                        value: true,
                        message: "Ingrese correo.",
                      },
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "El correo debe ser valido.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.correo ? "border-primary" : ""
                    }`}
                  />
                  {errors?.correo && (
                    <span className="text-primary">
                      {errors?.correo?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* TELEFONO MOVIL 1 */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Telefono movil 1:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`telefono_movil_1`, {
                      required: {
                        value: true,
                        message: "Ingrese celular.",
                      },
                      pattern: {
                        value: /^9\d{8}$/,
                        message: "Ingrese un número celular válido.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.telefono_movil_1 ? "border-primary" : ""
                    }`}
                  />
                  {errors?.telefono_movil_1 && (
                    <span className="text-primary">
                      {errors?.telefono_movil_1?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* TELEFONO MOVIL 2 */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Telefono movil 2:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`telefono_movil_2`, {
                      pattern: {
                        value: /^9\d{8}$/,
                        message:
                          "Ingrese un número de telefono movil_2 válido.",
                      },
                    })}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.telefono_movil_2 ? "border-primary" : ""
                    }`}
                  />
                  {errors?.telefono_movil_2 && (
                    <span className="text-primary">
                      {errors?.telefono_movil_2?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* TELEFONO FIJO 1 */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Telefono fijo 1:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`telefono_fijo_1`)}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.telefono_fijo_1 ? "border-primary" : ""
                    }`}
                  />
                  {errors?.telefono_fijo_1 && (
                    <span className="text-primary">
                      {errors?.telefono_fijo_1?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* TELEFONO FIJO 2 */}
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Telefono fijo 2:</label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register(`telefono_fijo_2`)}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors?.telefono_fijo_2 ? "border-primary" : ""
                    }`}
                  />
                </div>
              </div>
            </TabModalPanel>

            <TabModalPanel value={value} index={5}>
              <p className="mt-3">
                Un establecimiento es una copia de tu empresa a la que puedes
                ponerle su propia dirección, logo, usuarios, etc. Puedes usar un
                establecimiento para otro local, punto de venta o para otro
                negocio que use el mismo RUC.
              </p>
              <div className={`flex justify-end mt-2`}>
                <button
                  type="button"
                  onClick={() => {
                    appendEstablecimiento({
                      codigo: "",
                      denominacion: getValues("razon_social"),
                      departamento: {
                        label: "-",
                        value: "",
                      },
                      provincia: {
                        label: "-",
                        value: "",
                      },
                      distrito: {
                        label: "-",
                        value: "",
                      },
                      direccion: "",
                      ubigeo: "",
                    });
                  }}
                  className="border px-2 hover:bg-hover"
                >
                  Agregar establecimientos
                </button>
              </div>
              {fieldsEstablecimientos.map((item, index) => {
                return (
                  <div key={item.id} className="w-full">
                    <fieldset className="w-full border rounded-sm p-[8px] mb-2">
                      <legend className="p-[0_12px] dark:text-white">
                        Establecimiento {index + 1}
                      </legend>
                      <div className="w-full flex flex-row gap-2 mb-2">
                        <div className="flex w-1/2">
                          <div className="w-1/3">
                            <label>
                              Codigo:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3">
                            <input
                              {...register(`establecimientos.${index}.codigo`, {
                                required: {
                                  value: true,
                                  message: "Ingrese código.",
                                },
                              })}
                              className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                errors?.establecimientos?.[index]?.codigo
                                  ? "border-primary"
                                  : ""
                              }`}
                            />
                            {errors?.establecimientos?.[index]?.codigo && (
                              <span className="text-primary">
                                {
                                  errors?.establecimientos?.[index]?.codigo
                                    ?.message
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex w-1/2">
                          <div className="w-1/3">
                            <label>
                              Denominacion:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3">
                            <input
                              {...register(
                                `establecimientos.${index}.denominacion`,
                                {
                                  required: {
                                    value: true,
                                    message: "Ingrese denominación.",
                                  },
                                }
                              )}
                              className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                errors?.establecimientos?.[index]?.denominacion
                                  ? "border-primary"
                                  : ""
                              }`}
                            />
                            {errors?.establecimientos?.[index]
                              ?.denominacion && (
                              <span className="text-primary">
                                {
                                  errors?.establecimientos?.[index]
                                    ?.denominacion?.message
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full flex flex-row gap-2 mb-2">
                        <div className="flex w-1/3">
                          <div className="w-1/3">
                            <label>
                              Departamento:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3">
                            <Controller
                              name={`establecimientos.${index}.departamento`}
                              control={control}
                              render={({ field }) => (
                                <SelectSimple
                                  {...field}
                                  className="departamento-single"
                                  classNamePrefix="select"
                                  isSearchable={false}
                                  isLoading={isLoadingDepartamentos}
                                  onChange={(event) =>
                                    onChangeEntidad(
                                      "DEPARTAMENTO",
                                      field,
                                      index,
                                      event
                                    )
                                  }
                                  options={listDepartamentos}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex w-1/3">
                          <div className="w-1/3">
                            <label>
                              Provincia:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3">
                            <Controller
                              name={`establecimientos.${index}.provincia`}
                              control={control}
                              render={({ field }) => {
                                return (
                                  <SelectSimple
                                    {...field}
                                    className="provincia-single"
                                    classNamePrefix="select"
                                    isSearchable={false}
                                    isLoading={
                                      loadingChange || isLoadingProvincias
                                    }
                                    loadingMessage={() =>
                                      "Consulte departamento"
                                    }
                                    onChange={(event) =>
                                      onChangeEntidad(
                                        "PROVINCIA",
                                        field,
                                        index,
                                        event
                                      )
                                    }
                                    options={listEntidad(index, "PROVINCIAS")}
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex w-1/3">
                          <div className="w-1/3">
                            <label>
                              Distrito:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3">
                            <Controller
                              name={`establecimientos.${index}.distrito`}
                              control={control}
                              render={({ field }) => (
                                <SelectSimple
                                  {...field}
                                  className="distrito-single"
                                  classNamePrefix="select"
                                  isSearchable={false}
                                  isLoading={
                                    loadingChange || isLoadingDistritos
                                  }
                                  loadingMessage={() => "Consulte provincia"}
                                  onChange={(event) =>
                                    onChangeEntidad(
                                      "DISTRITO",
                                      field,
                                      index,
                                      event
                                    )
                                  }
                                  options={listEntidad(index, "DISTRITOS")}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="w-full flex flex-row gap-2 mb-2">
                        <div className="flex w-1/2">
                          <div className="w-1/3">
                            <label>
                              Direccion:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3">
                            <input
                              {...register(
                                `establecimientos.${index}.direccion`,
                                {
                                  required: {
                                    value: true,
                                    message: "Ingrese direccion.",
                                  },
                                }
                              )}
                              className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                errors?.establecimientos?.[index]?.direccion
                                  ? "border-primary"
                                  : ""
                              }`}
                            />
                            {errors?.establecimientos?.[index]?.direccion && (
                              <span className="text-primary">
                                {
                                  errors?.establecimientos?.[index]?.direccion
                                    ?.message
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex w-1/2">
                          <div className="w-1/3">
                            <label>Logo:</label>
                          </div>
                          <div className="w-2/3">
                            <input
                              type="file"
                              accept=".png"
                              {...register(`establecimientos.${index}.logo`)}
                              className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                errors?.establecimientos?.[index]?.logo
                                  ? "border-primary"
                                  : ""
                              }`}
                            />
                            {errors?.establecimientos?.[index]?.logo && (
                              <span className="text-primary">
                                {
                                  errors?.establecimientos?.[index]?.logo
                                    ?.message
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full flex flex-row gap-2">
                        <div className="flex w-1/2">
                          <div className="w-1/3">
                            <label>
                              Ubigeo:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3">
                            <input
                              {...register(`establecimientos.${index}.ubigeo`, {
                                required: {
                                  value: true,
                                  message: "Ingrese ubigeo.",
                                },
                              })}
                              className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                errors?.establecimientos?.[index]?.ubigeo
                                  ? "border-primary"
                                  : ""
                              }`}
                            />
                            {errors?.establecimientos?.[index]?.ubigeo && (
                              <span className="text-primary">
                                {
                                  errors?.establecimientos?.[index]?.ubigeo
                                    ?.message
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                );
              })}
            </TabModalPanel>
          </form>
        </DialogBody>
        <DialogButtons>
          <button
            onClick={closeModal}
            className="min-w-[84px] min-h-[24px] mr-[8px] text-[#066397] cursor-pointer bg-transparent border border-solid rounded-md"
          >
            Cancelar 
          </button>
          <button
            disabled={isLoadingEmpresa}
            onClick={handleSubmit(onSubmit)}
            className={`min-w-[84px] min-h-[24px] text-white cursor-pointer  border border-solid rounded-md ${
              isLoadingEmpresa ? "bg-red-500" : "bg-primary"
            }`}
          >
            OK
          </button>
        </DialogButtons>
      </DialogBasic>
      <DevTool control={control} />
    </>
  );
};

export default EmpresaEdit;
