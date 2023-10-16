import { SubmitHandler, useForm, FormProvider } from "react-hook-form";
import { DialogBeta } from "../Dialog/DialogBasic";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import { ModalContext } from "../../context/modalContext";
import { usePostEmpresa } from "../../hooks/useEmpresa";
import Button from "@mui/material/Button";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import Box from "@mui/material/Box";
import TabsModal from "../Material/Tabs/TabsModal";
import TabModal from "../Material/Tab/TabModal";
import TabModalPanel from "../Material/Tab/TabModalPanel";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { yupResolver } from "@hookform/resolvers/yup";
import EmpresaCreateDocumentos from "./FormCreate/EmpresaCreateDocumentos";
import EmpresaCreateContactos from "./FormCreate/EmpresaCreateContactos";
import EmpresaCreateGeneral from "./FormCreate/EmpresaCreateGeneral";
import EmpresaCreateConfiguraciones from "./FormCreate/EmpresaCreateConfiguraciones";
import { FORM_INITIAL_EMPRESA } from "../../utils/initials";
import { schemaFormEmpresa } from "../../utils/yup_validations";
import { IEmpresa } from "../../interface/empresa.interface";

const EmpresaCreate = () => {
  const methods = useForm<IEmpresa>({
    defaultValues: FORM_INITIAL_EMPRESA,
    resolver: yupResolver(schemaFormEmpresa),
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  const { dispatch, dialogState } = useContext(ModalContext);

  const [value, setValue] = useState(0);

  const { mutateAsync: mutateEmpresaAsync, isLoading: isLoadingEmpresa } =
    usePostEmpresa();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onSubmit: SubmitHandler<IEmpresa> = async (values) => {
    const formData = new FormData();
    try {
      if (values.logo && values.logo?.length > 0) {
        formData.append("logo", values.logo[0]);
      }

      if (values.cert && values?.cert?.length > 0) {
        formData.append("certificado", values.cert[0]);
      }

      formData.append("data", JSON.stringify(values));
      const res = await mutateEmpresaAsync(formData);
      toast.success(res.message);
      dispatch({ type: "INIT" });
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
    // dispatch({ type: "INIT" });
  };

  return (
    <DialogBeta open={dialogState.open}>
      <DialogTitleBeta>Crear empresa</DialogTitleBeta>
      <IconButton
        aria-label="close"
        onClick={() => dispatch({ type: "INIT" })}
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
      <TabsModal aria-label="BasicTabs" value={value} onChange={handleChange}>
        <TabModal label="General" index={0} />
        <TabModal label="Configuraciones" index={1} />
        <TabModal label="Documentos" index={2} />
        <TabModal label="Contacto" index={3} />
      </TabsModal>
      <DialogContentBeta>
        <Box sx={{ width: "100%", padding: 0 }}>
          <FormProvider {...methods}>
            <form>
              <TabModalPanel value={value} index={0}>
                <EmpresaCreateGeneral />
              </TabModalPanel>
              <TabModalPanel value={value} index={1}>
                <EmpresaCreateConfiguraciones />
              </TabModalPanel>
              <TabModalPanel value={value} index={2}>
                <EmpresaCreateDocumentos />
              </TabModalPanel>
              <TabModalPanel value={value} index={3}>
                <EmpresaCreateContactos />
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
          onClick={() => dispatch({ type: "INIT" })}
        >
          Cancelar
        </Button>
        <Button
          disabled={isLoadingEmpresa || !isDirty || !isValid}
          onClick={(e) => handleSubmit(onSubmit)(e)}
          size="small"
          variant="contained"
          color="primary"
        >
          OK
        </Button>
      </DialogActionsBeta>
    </DialogBeta>
  );
};

export default EmpresaCreate;
