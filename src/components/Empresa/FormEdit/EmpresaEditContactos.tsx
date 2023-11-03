import { Controller, useFormContext } from "react-hook-form";
import { IEmpresa } from "../../../interface/empresa.interface";
import { Grid } from "@mui/material";
import InputText from "../../Material/Input/InputText";

const EmpresaEditContactos = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<IEmpresa>();

  return (
    <>
      <Grid container spacing={2}>
        {/* CORREO */}
        <Grid item xs={3}>
          Correo: <strong className="text-primary">*</strong>
        </Grid>
        <Grid item xs={3}>
          <Controller
            control={control}
            name="correo"
            render={({ field }) => (
              <InputText
                {...field}
                variant="filled"
                error={!!errors.correo}
                helperText={errors.correo?.message}
              />
            )}
          />
        </Grid>
        {/* TELEFONO MOVIL1 */}
        <Grid item xs={3}>
          Telefono movil 1: <strong className="text-primary">*</strong>
        </Grid>
        <Grid item xs={3}>
          <Controller
            control={control}
            name="telefono_movil_1"
            render={({ field }) => (
              <InputText
                {...field}
                variant="filled"
                inputProps={{ maxLength: 9 }}
                error={!!errors.telefono_movil_1}
                helperText={errors.telefono_movil_1?.message}
              />
            )}
          />
        </Grid>
        {/* TELEFONO MOVIL 2 OPCIONAL */}
        <Grid item xs={3}>
          Telefono movil 2:
        </Grid>
        <Grid item xs={3}>
          <Controller
            control={control}
            name="telefono_movil_2"
            render={({ field }) => (
              <InputText
                {...field}
                variant="filled"
                inputProps={{ maxLength: 9 }}
                error={!!errors.telefono_movil_2}
                helperText={errors.telefono_movil_2?.message}
              />
            )}
          />
        </Grid>
        {/* TELEFONO FIJO 1 OPCIONAL*/}
        <Grid item xs={3}>
          Telefono fijo 1:
        </Grid>
        <Grid item xs={3}>
          <Controller
            control={control}
            name="telefono_fijo_1"
            render={({ field }) => (
              <InputText
                {...field}
                variant="filled"
                error={!!errors.telefono_fijo_1}
                helperText={errors.telefono_fijo_1?.message}
              />
            )}
          />
        </Grid>
        {/* TELEFONO FIJO 2 OPCIONAL */}
        <Grid item xs={3}>
          Telefono fijo 2:
        </Grid>
        <Grid item xs={3}>
          <Controller
            control={control}
            name="telefono_fijo_2"
            render={({ field }) => (
              <InputText
                {...field}
                variant="filled"
                error={!!errors.telefono_fijo_2}
                helperText={errors.telefono_fijo_2?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EmpresaEditContactos;
