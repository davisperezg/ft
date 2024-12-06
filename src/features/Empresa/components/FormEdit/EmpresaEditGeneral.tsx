import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Button, Grid, Stack } from "@mui/material";

import { SelectSimple } from "../../../../components/common/Selects/SelectSimple";
import { useUsersEmpresa } from "../../hooks/useEmpresa";
import InputFile from "../../../../components/Material/Input/InputFile";
import { useRef, ChangeEvent } from "react";
import InputText from "../../../../components/Material/Input/InputText";
import { IEmpresa } from "../../../../interfaces/models/empresa/empresa.interface";

let imagePreview = "";

const EmpresaEditGeneral = () => {
  const {
    control,
    setValue: setValueModel,
    formState: { errors },
  } = useFormContext<IEmpresa>();

  const valuesWatch = useWatch({
    control,
  });

  const {
    data: dataUsers,
    isLoading: isLoadingUsers,
    error: errorUsers,
    isError: isErrorUsers,
  } = useUsersEmpresa();

  const refLogo = useRef<HTMLInputElement | null>(null);

  const onChangeFoto = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: any
  ) => {
    const files = (e.target as HTMLInputElement).files as FileList;

    if (files.length > 0) {
      if (files[0].type !== "image/png") {
        alert("Por favor, selecciona un archivo PNG.");
        setValueModel("logo", undefined);
      } else {
        const imageUrl = URL.createObjectURL(files[0]);
        imagePreview = imageUrl;
        field.onChange(files);
      }
    }
  };

  const listUsuarios =
    dataUsers?.map((item) => ({
      value: item.id,
      label: `${item.id} - ${item.usuario}`,
    })) || [];

  const handleBrowseLogoButtonClick = () => {
    if (refLogo.current) {
      return refLogo?.current?.click();
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <Grid xs={12} item container>
            {/* Usuario */}
            <Grid item xs={4}>
              Usuario: <strong className="text-danger">*</strong>
            </Grid>
            <Grid item xs={8} container>
              <Grid item xs={8}>
                <Controller
                  name="usuario"
                  control={control}
                  render={({ field }) => {
                    return (
                      <SelectSimple
                        {...field}
                        className="usuario-single"
                        classNamePrefix="select"
                        isSearchable={false}
                        isLoading={isLoadingUsers}
                        options={listUsuarios}
                        placeholder="Seleccione usuario"
                        error={!!errors.usuario || isErrorUsers}
                        helperText={
                          errors.usuario?.message ||
                          errorUsers?.response.data.message
                        }
                        value={listUsuarios.find(
                          ({ value }) => Number(value) === valuesWatch.usuario
                        )}
                        onChange={(e: any) => setValueModel("usuario", e.value)}
                        isDisabled
                      />
                    );
                  }}
                />
              </Grid>
            </Grid>

            {/* Ruc */}
            <Grid item xs={4}>
              Ruc: <strong className="text-danger">*</strong>
            </Grid>
            <Grid item xs={8} container>
              <Grid item xs={8}>
                <Controller
                  name="ruc"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      hiddenLabel
                      variant="filled"
                      error={!!errors.ruc}
                      helperText={errors.ruc?.message}
                      inputProps={{ maxLength: 11 }}
                      disabled
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Razon social */}
            <Grid item xs={4}>
              Razon social: <strong className="text-danger">*</strong>
            </Grid>
            <Grid item xs={8} container>
              <Grid item xs={8}>
                <Controller
                  name="razon_social"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      variant="filled"
                      error={!!errors.razon_social}
                      helperText={errors.razon_social?.message}
                      disabled
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Nombre comercial */}
            <Grid item xs={4}>
              Nombre comercial: <strong className="text-danger">*</strong>
            </Grid>
            <Grid item container xs={8}>
              <Grid item xs={8}>
                <Controller
                  name="nombre_comercial"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      variant="filled"
                      error={!!errors.nombre_comercial}
                      helperText={errors.nombre_comercial?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Domicilio fiscal */}
            <Grid item xs={4}>
              Domicilio fiscal: <strong className="text-danger">*</strong>
            </Grid>
            <Grid item container xs={8}>
              <Grid item xs={8}>
                <Controller
                  name="domicilio_fiscal"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      variant="filled"
                      error={!!errors.domicilio_fiscal}
                      helperText={errors.domicilio_fiscal?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Ubigeo */}
            <Grid item xs={4}>
              Ubigeo: <strong className="text-danger">*</strong>
            </Grid>
            <Grid item container xs={8}>
              <Grid item xs={8}>
                <Controller
                  name="ubigeo"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      variant="filled"
                      error={!!errors.ubigeo}
                      helperText={errors.ubigeo?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Urbanizacion */}
            <Grid item xs={4}>
              Urbanizacion: <strong className="text-danger">*</strong>
            </Grid>
            <Grid item container xs={8}>
              <Grid item xs={8}>
                <Controller
                  name="urbanizacion"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      variant="filled"
                      error={!!errors.urbanizacion}
                      helperText={errors.urbanizacion?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Stack spacing={1}>
            <Button
              fullWidth
              onClick={handleBrowseLogoButtonClick}
              color="borderAux"
              variant="outlined"
              sx={{
                height: 150,
                width: "100%",
              }}
            >
              {!!valuesWatch.logo?.length && (
                <img
                  src={(valuesWatch.logo?.[0] as any).src || imagePreview}
                  alt="Logo Preview"
                  className="w-[100%] h-[100%] object-contain block m-auto"
                />
              )}
            </Button>
            <span className="text-center break-words">
              {valuesWatch.logo?.[0].name}
            </span>
            <Controller
              name="logo"
              control={control}
              render={({ field }) => (
                <InputFile
                  variant="text"
                  color="secondary"
                  title="Subir logo"
                  other={{
                    ...field,
                    inputProps: { accept: ".png" },
                    onChange: (e) => onChangeFoto(e, field),
                    inputRef: (e) => {
                      refLogo.current = e;
                      field.ref(e);
                    },
                  }}
                />
              )}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default EmpresaEditGeneral;
