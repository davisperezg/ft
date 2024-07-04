import { MouseEvent, memo, useCallback, useEffect, useState } from "react";
import { IInvoice } from "../../interface/invoice.interface";
import { MenuDropdown } from "../Material/Menu/MenuList";
import { Alert, Button, MenuItem } from "@mui/material";
import { Row } from "@tanstack/react-table";
import { SlOptionsVertical } from "react-icons/sl";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { MdIosShare } from "react-icons/md";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSocketInvoice } from "../../hooks/useSocket";
import { forwardRef } from "react";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import InputText from "../Material/Input/InputText";
import { DialogBeta } from "../Dialog/DialogBasic";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schemaFormComuBaja } from "../../utils/yup_validations";
import { toast } from "react-toastify";

interface CPEAcctionListProps {
  row: Row<IInvoice>;
  comunicatBaja: (serie: string, correlativo: string, motivo: string) => void;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface IComuBaja {
  motivo: string;
}

const initialNotify = {
  loading: false,
  estado: "",
  mensaje: "",
};

const CPEAcctionList = memo(({ row, comunicatBaja }: CPEAcctionListProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMotivo, setOpenMotivo] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const [isActiveOpt, setActiveOpt] = useState<null | number>(null);
  const { socket } = useSocketInvoice();
  const [notify, setNotify] = useState(initialNotify);

  const methods = useForm<IComuBaja>({
    defaultValues: {
      motivo: "",
    },
    resolver: yupResolver(schemaFormComuBaja),
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
  } = methods;

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setActiveOpt(row.index);
      setAnchorEl(event.currentTarget);
    },
    [row.index]
  );

  const handleOpenMotivo = useCallback(() => {
    setOpenMotivo(true);
    handleClose();
    setNotify(initialNotify);
  }, [handleClose]);

  const handleCloseMotivo = useCallback(() => {
    setOpenMotivo(false);
    setValue("motivo", "");
    setNotify(initialNotify);
  }, [setValue]);

  const onSubmit: SubmitHandler<IComuBaja> = useCallback(
    async (values) => {
      setNotify((prev) => ({ ...prev, loading: true }));
      comunicatBaja(
        String(row.original.serie),
        String(row.original.correlativo),
        values.motivo
      );
    },
    [comunicatBaja, row.original.serie, row.original.correlativo]
  );

  useEffect(() => {
    if (socket) {
      const receiveComuBaja = (data: any) => {
        setNotify({
          loading: data.loading,
          estado: data.estado,
          mensaje: data.mensaje,
        });

        if (
          data.estado === "success" &&
          data.correlativo === row.original.correlativo
        ) {
          toast.success(data.mensaje);
        }

        if (
          data.estado === "successfull" &&
          data.correlativo === row.original.correlativo
        ) {
          toast.success(data.mensaje);
          handleCloseMotivo();
        }

        if (
          data.estado === "warning" &&
          data.correlativo === row.original.correlativo
        ) {
          toast.error(data.mensaje);
        }
      };

      const handleException = () => {
        setNotify((prev) => ({ ...prev, loading: false }));
      };

      socket.on("server::comuBaja", receiveComuBaja);

      socket.on("exception", handleException);

      return () => {
        socket.off("server::comuBaja", receiveComuBaja);
        socket.off("exception", handleException);
      };
    }
  }, [socket, row.original.correlativo, handleCloseMotivo]);

  return (
    <>
      <div className="text-[24px] text-center flex justify-center">
        <Button
          id="demo-customized-button"
          aria-controls={open ? "demo-customized-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          variant="text"
          color="secondary"
          disableElevation
          className="cursor-pointer "
        >
          <SlOptionsVertical className="text-black-700" />
        </Button>

        {isActiveOpt !== null && Number(isActiveOpt) === Number(row.index) && (
          <MenuDropdown
            id="demo-customized-menu"
            MenuListProps={{
              "aria-labelledby": "demo-customized-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} disableRipple>
              <MdIosShare className="text-[18px] mr-1" /> Compartir
            </MenuItem>
            <MenuItem onClick={handleClose} disableRipple>
              <MdOutlineContentCopy className="text-[18px] mr-1" /> Copiar en...
            </MenuItem>
            {/* 
            {row.original.estado_anulacion === 2 ||
            row.original.estado_anulacion === 3 ||
            row.original.estado_operacion !== 2 ? null : (
              <MenuItem onClick={handleOpenMotivo} disableRipple>
                <MdOutlineSettingsBackupRestore className="text-[18px] mr-1" />{" "}
                Comunicar de baja
              </MenuItem>
            )} 
*/}
            <MenuItem onClick={handleOpenMotivo} disableRipple>
              <MdOutlineSettingsBackupRestore className="text-[18px] mr-1" />{" "}
              Comunicar de baja
            </MenuItem>
          </MenuDropdown>
        )}
      </div>
      <DialogBeta
        open={openMotivo}
        TransitionComponent={Transition}
        aria-describedby="alert-dialog-slide-motivo"
        keepMounted
        PaperProps={{
          sx: {
            "&.MuiDialog-paper": {
              overflow: "hidden",
              height: "auto",
              backgroundColor: "#fff",
              width: "550px",
            },
          },
        }}
      >
        <DialogTitleBeta>
          Comunicar de baja {row.original.serie}-{row.original.correlativo}
        </DialogTitleBeta>
        <IconButton
          aria-label="close"
          onClick={handleCloseMotivo}
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

        <DialogContentBeta sx={{ padding: 2 }}>
          <div className="flex flex-col">
            <form className="flex flex-col gap-3">
              <Alert
                className="flex justify-center items-center"
                severity="warning"
              >
                <div className="flex-col">
                  <strong className="w-full flex justify-center items-center">
                    MUY IMPORTANTE:
                  </strong>
                  <span className="flex justify-center items-center text-center">
                    Si la Comunicación de Baja es rechazada se deberá emitir una
                    Nota de Crédito para anular el comprobante que no se pudo
                    anular usando esta opción. Las comunicaciones de baja de las
                    Boletas de Venta o notas asociadas son enviadas a la SUNAT o
                    al OSE luego de que el comprobantes asociado sea aceptada.
                    Esto ocurre normalmente al día siguiente. Si la Boleta de
                    Venta o nota es rechazada la comunicación de baja no tiene
                    ningún efecto.
                  </span>
                </div>
              </Alert>

              {(errors.motivo ||
                notify.estado === "error" ||
                notify.estado === "excepcion") && (
                <Alert severity="error">
                  {errors?.motivo?.message || notify.mensaje}
                </Alert>
              )}

              {notify.estado === "warning" && (
                <Alert severity="info">{notify.mensaje}</Alert>
              )}

              <div className="w-full">
                <Controller
                  name="motivo"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      hiddenLabel
                      variant="filled"
                      placeholder="Motivo"
                      disabled={notify.loading}
                    />
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isDirty || !isValid || notify.loading}
                variant="contained"
                onClick={(e) => handleSubmit(onSubmit)(e)}
              >
                {notify.loading
                  ? "Comunicando la baja..."
                  : "Crear Comunicación de baja"}
              </Button>
            </form>
          </div>
        </DialogContentBeta>
      </DialogBeta>
    </>
  );
});

export default CPEAcctionList;
