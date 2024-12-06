import { useContext, useState } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { usePostUser } from "../hooks/useUsers";
import { toast } from "react-toastify";
import TabModalPanel from "../../../components/Material/Tab/TabModalPanel";
import { isError } from "../../../utils/functions.utils";
import { toastError } from "../../../components/common/Toast/ToastNotify";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TabsModal from "../../../components/Material/Tabs/TabsModal";
import TabModal from "../../../components/Material/Tab/TabModal";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import Box from "@mui/material/Box";
import UserCreateGeneral from "../components/FormCreate/UserCreateGeneral";
import UserCreateAsignarEmpresa from "../components/FormCreate/UserCreateAsignarEmpresa";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import Button from "@mui/material/Button";
import { useAsignEmpresasByIdPartner } from "../../Empresa/hooks/useEmpresa";
import { yupResolver } from "@hookform/resolvers/yup";
import { IUserWithPassword } from "../../../interfaces/models/user/user.interface";
import { schemaFormUser } from "../validations/user.schema";
import { FORM_INITIAL_USER } from "../../../config/constants";
import { IEmpresaAsign } from "../../../interfaces/models/empresa/empresa.interface";
import { useUserStore } from "../../../store/zustand/user-zustand";

const UserCreate = () => {
  const { dispatch, dialogState } = useContext(ModalContext);
  const userGlobal = useUserStore((state) => state.userGlobal);

  const { mutateAsync, isPending: isLoadingPost } = usePostUser();

  const {
    data,
    error,
    isLoading: isLoadingAsignEmpresas,
  } = useAsignEmpresasByIdPartner(String(userGlobal?.id));

  console.log(data);

  const methods = useForm<IUserWithPassword>({
    defaultValues: FORM_INITIAL_USER,
    values: {
      ...FORM_INITIAL_USER,
      empresasAsign: data?.map((item) => ({
        ...item,
        checked: false,
        establecimientos: item.establecimientos.map((est) => ({
          ...est,
          checked: false,
        })),
      })),
    },
    resolver: yupResolver(schemaFormUser),
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  const onSubmit: SubmitHandler<IUserWithPassword> = async (values) => {
    try {
      let empresasAsign: IEmpresaAsign[] = [];

      if (values.empresasAsign && values.empresasAsign.length > 0) {
        empresasAsign = values.empresasAsign
          .map((item) => {
            if (item.checked) {
              return {
                ...item,
                establecimientos: item.establecimientos.filter(
                  (est) => est.checked
                ),
              };
            }
          })
          .filter(Boolean) as IEmpresaAsign[];
      }

      const res = await mutateAsync({
        ...values,
        empresasAsign,
      });
      toast.success(res.message);
      dispatch({ type: "INIT" });
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
  };

  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <>
      <DialogBeta open={dialogState.open}>
        <DialogTitleBeta>Crear usuario</DialogTitleBeta>
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
          {data && data?.length > 0 && (
            <TabModal label="Asignar empresa" index={1} />
          )}
        </TabsModal>

        <DialogContentBeta>
          <Box sx={{ width: "100%", padding: 0 }}>
            <FormProvider {...methods}>
              <form>
                <TabModalPanel value={value} index={0}>
                  <UserCreateGeneral />
                </TabModalPanel>
                {data && data?.length > 0 && (
                  <TabModalPanel value={value} index={1}>
                    <UserCreateAsignarEmpresa
                      isLoading={isLoadingAsignEmpresas}
                      error={error}
                    />
                  </TabModalPanel>
                )}
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
            onClick={() => dispatch({ type: "INIT" })}
          >
            Cancelar
          </Button>
          <Button
            disabled={isLoadingPost || !isDirty || !isValid}
            onClick={(e) => handleSubmit(onSubmit)(e)}
            size="small"
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActionsBeta>
      </DialogBeta>
    </>
  );
};

export default UserCreate;
