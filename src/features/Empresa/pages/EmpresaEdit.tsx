import {
  SubmitHandler,
  useForm,
  FormProvider,
  Resolver,
} from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isError } from "../../../utils/functions.utils";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import { useEditEmpresa, useEmpresa } from "../hooks/useEmpresa";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import IconButton from "@mui/material/IconButton";
import TabsModal from "../../../components/Material/Tabs/TabsModal";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import TabModal from "../../../components/Material/Tab/TabModal";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import EmpresaEditGeneral from "../components/FormEdit/EmpresaEditGeneral";
import EmpresaEditConfiguraciones from "../components/FormEdit/EmpresaEditConfiguraciones";
import EmpresaEditDocumentos from "../components/FormEdit/EmpresaEditDocumentos";
import EmpresaEditContactos from "../components/FormEdit/EmpresaEditContactos";
import EmpresaEditEstablecimientos from "../components/FormEdit/EmpresaEditEstablecimientos";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import Button from "@mui/material/Button";
import TabModalPanel from "../../../components/Material/Tab/TabModalPanel";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingTotal from "../../../components/common/Loadings/LoadingTotal";
import { FORM_INITIAL_EMPRESA_UPDATE } from "../../../config/constants";
import {
  _schemaFormEmpresaUpdate,
  schemaFormEmpresaUpdate,
} from "../validations/empresa.schema";
import { IFeatureEmpresaUpdate } from "../../../interfaces/features/empresa/empresa.interface";
import { IFormEmpresaUpdate } from "../../../interfaces/forms/empresa/empresa.interface";
import { IDTOEmpresa } from "../../../interfaces/models/empresa/empresa.interface";
import { Option } from "../../../interfaces/common/option.interface";

interface Props {
  state: {
    visible: boolean;
    row: IDTOEmpresa;
  };
  closeEdit: () => void;
}

const EmpresaEdit = ({ state, closeEdit }: Props) => {
  const {
    isLoading: isLoadingGet,
    data: dataGetEmpresa,
    error: errorGetEmpresa,
  } = useEmpresa(Number(state.row.id));
  const [value, setValue] = useState(0);

  const methods = useForm<IFeatureEmpresaUpdate>({
    values: dataGetEmpresa
      ? {
          cert: dataGetEmpresa.cert,
          correo: dataGetEmpresa.correo,
          cert_password: dataGetEmpresa.cert_password,
          documentos:
            dataGetEmpresa.documentos?.map((a) => {
              return {
                id: a.id,
                nombre: a.nombre,
                estado: a.estado,
                new: false,
              };
            }) ?? [],
          domicilio_fiscal: dataGetEmpresa.domicilio_fiscal,
          establecimientos: dataGetEmpresa.establecimientos.map((a) => {
            return {
              codigo: a.codigo,
              denominacion: a.denominacion,
              direccion: a.direccion,
              ubigeo: a.ubigeo,
              estado: a.estado,
              new: false,
              logo: a.logo,
              id: a.id,
              departamento: a.departamento,
              distrito: a.distrito,
              provincia: a.provincia,
            };
          }),
          logo: dataGetEmpresa.logo,
          modo: dataGetEmpresa.modo,
          ose_enabled: dataGetEmpresa.ose_enabled,
          ubigeo: dataGetEmpresa.ubigeo,
          nombre_comercial: dataGetEmpresa.nombre_comercial,
          telefono_fijo_1: dataGetEmpresa.telefono_fijo_1,
          telefono_movil_1: dataGetEmpresa.telefono_movil_1,
          telefono_fijo_2: dataGetEmpresa.telefono_fijo_2,
          telefono_movil_2: dataGetEmpresa.telefono_movil_2,
          urbanizacion: dataGetEmpresa.urbanizacion,
          web_service: dataGetEmpresa.web_service,
          usu_secundario_user: dataGetEmpresa.usu_secundario_user,
          usu_secundario_password: dataGetEmpresa.usu_secundario_password,
          usu_secundario_ose_password:
            dataGetEmpresa.usu_secundario_ose_password,
          usu_secundario_ose_user: dataGetEmpresa.usu_secundario_ose_user,
        }
      : FORM_INITIAL_EMPRESA_UPDATE,
    resolver: yupResolver(
      schemaFormEmpresaUpdate
    ) as Resolver<_schemaFormEmpresaUpdate>,
    mode: "onChange",
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const { mutateAsync: mutateEmpresaAsync, isPending: isLoadingEmpresa } =
    useEditEmpresa();

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  const onSubmit: SubmitHandler<IFeatureEmpresaUpdate> = async (values) => {
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

        const senData: IFormEmpresaUpdate = {
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
                departamento: a.departamento! as Option,
                provincia: a.provincia! as Option,
                distrito: a.distrito! as Option,
                logo: a.logo?.[0].name,
              };
            }) ?? [],
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
          toast.error(e.response.data.message);
        }
      }
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) =>
    setValue(newValue);

  const closeModal = () => {
    closeEdit();
  };

  useEffect(() => {
    if (errorGetEmpresa) {
      toast.error(errorGetEmpresa.response?.data?.message);
    }
  }, [errorGetEmpresa]);

  return (
    <>
      {isLoadingGet ? (
        <LoadingTotal fullscreen />
      ) : errorGetEmpresa ? null : (
        <DialogBeta open={state.visible}>
          <DialogTitleBeta>
            Edit empresa {state.row.razon_social}
          </DialogTitleBeta>
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
                    <EmpresaEditConfiguraciones data={state.row} />
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
              className="text-default"
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
