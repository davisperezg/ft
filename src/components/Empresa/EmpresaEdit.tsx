import { SubmitHandler, useForm, FormProvider } from "react-hook-form";
import { IEmpresa } from "../../interface/empresa.interface";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../context/modalContext";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import { DialogBeta } from "../Dialog/DialogBasic";

import { useEditEmpresa, useEmpresa } from "../../hooks/useEmpresa";
import { IUser } from "../../interface/user.interface";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import IconButton from "@mui/material/IconButton";
import TabsModal from "../Material/Tabs/TabsModal";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import TabModal from "../Material/Tab/TabModal";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import EmpresaEditGeneral from "./FormEdit/EmpresaEditGeneral";
import EmpresaEditConfiguraciones from "./FormEdit/EmpresaEditConfiguraciones";
import EmpresaEditDocumentos from "./FormEdit/EmpresaEditDocumentos";
import EmpresaEditContactos from "./FormEdit/EmpresaEditContactos";
import EmpresaEditEstablecimientos from "./FormEdit/EmpresaEditEstablecimientos";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import Button from "@mui/material/Button";
import TabModalPanel from "../Material/Tab/TabModalPanel";
import { FORM_INITIAL_EMPRESA } from "../../utils/initials";
import { schemaFormEmpresa } from "../../utils/yup_validations";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingTotal from "../Loading/LoadingTotal";

interface Props {
  data: IEmpresa;
  closeEdit: () => void;
}

const EmpresaEdit = ({ data, closeEdit }: Props) => {
  const { dispatch, dialogState } = useContext(ModalContext);
  const {
    isLoading: isLoadingGet,
    data: dataGetEmpresa,
    error: errorGetEmpresa,
  } = useEmpresa(Number(data.id));
  const [value, setValue] = useState(0);

  const methods = useForm<IEmpresa>({
    values: dataGetEmpresa
      ? {
          ...dataGetEmpresa,
          usuario: Number((dataGetEmpresa.usuario as IUser).id),
          establecimientos: dataGetEmpresa.establecimientos,
        }
      : FORM_INITIAL_EMPRESA,
    resolver: yupResolver(schemaFormEmpresa),
    mode: "onTouched",
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const { mutateAsync: mutateEmpresaAsync, isLoading: isLoadingEmpresa } =
    useEditEmpresa();

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  const onSubmit: SubmitHandler<IEmpresa> = async (values) => {
    if (dataGetEmpresa?.id) {
      try {
        const formData = new FormData();

        if (
          values.logo &&
          values.logo?.length > 0 &&
          values.logo[0].name !== dataGetEmpresa.logo?.[0].name
        ) {
          formData.append("logo", values.logo[0]);
        }

        if (
          values.cert &&
          values?.cert?.length > 0 &&
          values.cert[0].name !== dataGetEmpresa.cert?.[0].name
        ) {
          formData.append("certificado", values.cert[0]);
        }

        /**
         *Si existe establecimientos en nuestro form recorremos para enviar el objeto
         */
        if (values.establecimientos && values.establecimientos.length > 0) {
          for (let i = 0; i < values.establecimientos.length; i++) {
            const establecimiento = values.establecimientos[i];
            /**
             * Los establecimientos nuevos que contienen un logo serán enviados
             * por archivos binarios con un string formato objeto
             */
            if (establecimiento.new && establecimiento.logo) {
              formData.append(
                `establecimientos`,
                establecimiento.logo[0],
                `codigo:${establecimiento.codigo},name:${establecimiento.logo[0].name}`
              );
            }
            /**
             * Los establecimientos existentes que contienen un logo serán enviados
             * por archivos binarios con un string formato objeto adicionando un id
             */
            if (
              establecimiento.id &&
              establecimiento.logo &&
              establecimiento.logo?.[0].name !==
                dataGetEmpresa.establecimientos?.[i].logo?.[0].name
            ) {
              formData.append(
                `establecimientos`,
                establecimiento.logo[0],
                `codigo:${establecimiento.codigo},name:${establecimiento.logo?.[0].name},id:${establecimiento.id}`
              );
            }
          }
        }

        const senData = {
          nombre_comercial: values.nombre_comercial,
          domicilio_fiscal: values.domicilio_fiscal,
          ubigeo: values.ubigeo,
          urbanizacion: values.urbanizacion,
          web_service: values.web_service,
          cert_password: values.cert_password,
          modo: values.modo,
          ose_enabled: values.ose_enabled,
          usu_secundario_user: values.usu_secundario_user,
          usu_secundario_password: values.usu_secundario_password,
          usu_secundario_ose_user: values.usu_secundario_ose_user,
          usu_secundario_ose_password: values.usu_secundario_ose_password,
          correo: values.correo,
          telefono_movil_1: values.telefono_movil_1,
          telefono_movil_2: values.telefono_movil_2,
          telefono_fijo_1: values.telefono_fijo_1,
          telefono_fijo_2: values.telefono_fijo_2,
          documentos: values.documentos,
          establecimientos:
            values.establecimientos?.map((a) => {
              return {
                ...a,
                logo: a.logo?.[0].name,
              };
            }) || [],
        };

        formData.append("data", JSON.stringify(senData));

        if (values.modo === 1 && dataGetEmpresa.modo === 0) {
          const produccion = confirm(
            "La empresa está cambiando a modo PRODUCCIÓN ya no podras volver a modo BETA!."
          );
          if (produccion) {
            const res = await mutateEmpresaAsync({
              body: formData as any,
              id: dataGetEmpresa?.id,
            });
            toast.success(res.message);
            closeModal();
          }
        } else {
          const res = await mutateEmpresaAsync({
            body: formData as any,
            id: dataGetEmpresa?.id,
          });
          toast.success(res.message);
          closeModal();
        }
      } catch (e) {
        if (isError(e)) {
          toastError(e.response.data.message);
        }
      }
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) =>
    setValue(newValue);

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  useEffect(() => {
    if (errorGetEmpresa) {
      toastError(errorGetEmpresa.response?.data?.message);
    }
  }, [errorGetEmpresa]);

  return (
    <>
      {isLoadingGet ? (
        <LoadingTotal fullscreen />
      ) : errorGetEmpresa ? null : (
        <DialogBeta open={dialogState.open && !dialogState.nameDialog}>
          <DialogTitleBeta>Edit empresa {data.razon_social}</DialogTitleBeta>
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

          <TabsModal
            aria-label="BasicTabsEdit"
            value={value}
            onChange={handleChange}
          >
            <TabModal label="General" index={0} />
            <TabModal label="Configuraciones" index={1} />
            <TabModal label="Documentos" index={2} />
            <TabModal label="Contacto" index={3} />
            <TabModal label="Establecimientos" index={4} />
          </TabsModal>

          <DialogContentBeta>
            <Box sx={{ width: "100%", padding: 0 }}>
              <FormProvider {...methods}>
                <form>
                  <TabModalPanel value={value} index={0}>
                    <EmpresaEditGeneral />
                  </TabModalPanel>
                  <TabModalPanel value={value} index={1}>
                    <EmpresaEditConfiguraciones data={data} />
                  </TabModalPanel>
                  <TabModalPanel value={value} index={2}>
                    <EmpresaEditDocumentos />
                  </TabModalPanel>
                  <TabModalPanel value={value} index={3}>
                    <EmpresaEditContactos />
                  </TabModalPanel>
                  <TabModalPanel value={value} index={4}>
                    <EmpresaEditEstablecimientos />
                  </TabModalPanel>
                </form>
              </FormProvider>
            </Box>
          </DialogContentBeta>
          <DialogActionsBeta>
            <Button
              size="small"
              className="text-textDefault"
              variant="text"
              color="secondary"
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button
              disabled={!isDirty || !isValid || isLoadingEmpresa}
              onClick={(e) => handleSubmit(onSubmit)(e)}
              size="small"
              variant="contained"
              color="primary"
            >
              OK
            </Button>
          </DialogActionsBeta>
        </DialogBeta>
      )}
    </>
  );
};

export default EmpresaEdit;
