import { Button, Grid, Stack } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { SelectSimple } from "../../../../components/common/Selects/SelectSimple";
import InputText from "../../../../components/Material/Input/InputText";
import InputCheckBox from "../../../../components/Material/Input/InputCheckBox";
import { ChangeEvent, useRef } from "react";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import InputFile from "../../../../components/Material/Input/InputFile";
import { IFeatureEmpresaCreate } from "../../../../interfaces/features/empresa/empresa.interface";

const EmpresaCreateConfiguraciones = () => {
  const {
    control,
    setValue: setValueModel,
    formState: { errors },
  } = useFormContext<IFeatureEmpresaCreate>();

  const refCert = useRef<HTMLInputElement | null>(null);

  const valuesWatch = useWatch({
    control,
  });

  const optionsModo = [
    { value: 0, label: "Beta" },
    { value: 1, label: "Produccion" },
  ];

  const handleBrowseCertButtonClick = () => {
    if (refCert.current) {
      return refCert?.current?.click();
    }
  };

  const onChangeCert = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: any
  ) => {
    const files = (e.target as HTMLInputElement).files! as FileList;

    if (files.length > 0) {
      if (files[0].type !== "application/x-pkcs12") {
        alert("Por favor, selecciona un archivo PKCS12.");
        setValueModel("cert", undefined, { shouldValidate: true });
        setValueModel("cert_password", "", { shouldValidate: true });
      } else {
        field.onChange(files);
      }
    }
  };

  const onChangeModo = async (e: any) => {
    const value = e.value;

    if (value === 0) {
      //Beta
      setValueModel("cert", undefined);
      setValueModel("cert_password", "");
      setValueModel("usu_secundario_user", "");
      setValueModel("usu_secundario_password", "");
    }

    if (valuesWatch.ose_enabled) {
      setValueModel("usu_secundario_ose_user", "");
      setValueModel("usu_secundario_ose_password", "");
    }

    setValueModel("modo", e.value, { shouldValidate: true });

    //await schemaFormEmpresa.validate(getValues());
  };

  const onChangeIsOse = (e: any, field: any) => {
    const checked = e.target.checked;

    if (!checked) {
      setValueModel("web_service", "");
      setValueModel("usu_secundario_ose_user", "");
      setValueModel("usu_secundario_ose_password", "");
    } else {
      setValueModel("usu_secundario_user", "");
      setValueModel("usu_secundario_password", "");
    }

    field.onChange(checked);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <Grid xs={12} item container>
            {/* Modo */}
            <Grid item xs={4}>
              Modo:
            </Grid>

            <Grid item xs={8}>
              <Controller
                name="modo"
                control={control}
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    className="modo-single"
                    classNamePrefix="select"
                    isSearchable={false}
                    options={optionsModo}
                    placeholder="Seleccione modo"
                    value={optionsModo.find(
                      ({ value }) => Number(value) === valuesWatch.modo
                    )}
                    onChange={(e) => onChangeModo(e)}
                  />
                )}
              />
            </Grid>

            {/* OSE */}
            <Grid item xs={4}>
              Activar OSE:
            </Grid>

            <Grid item xs={8}>
              <Controller
                name="ose_enabled"
                control={control}
                render={({ field }) => (
                  <InputCheckBox
                    {...field}
                    onChange={(e) => onChangeIsOse(e, field)}
                  />
                )}
              />
            </Grid>

            {/* Si es modo Producciones aplica estas opciones */}
            {valuesWatch.modo === 1 ? (
              <>
                {valuesWatch.ose_enabled && (
                  <>
                    {/* LINK OSE */}
                    <Grid item xs={4}>
                      Link OSE: <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="web_service"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.web_service}
                            helperText={errors.web_service?.message}
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}

                {/* Certificado password*/}
                <Grid item xs={4}>
                  Certificado password:{" "}
                  <strong className="text-danger">*</strong>
                </Grid>

                <Grid item xs={8}>
                  <Controller
                    name="cert_password"
                    control={control}
                    render={({ field }) => (
                      <InputText
                        {...field}
                        variant="filled"
                        disabled={valuesWatch.cert ? false : true}
                        error={!!errors.cert_password}
                        helperText={errors.cert_password?.message}
                      />
                    )}
                  />
                </Grid>

                {valuesWatch.ose_enabled ? (
                  <>
                    {/* Usuario OSE */}
                    <Grid item xs={4}>
                      Usuario OSE: <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="usu_secundario_ose_user"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.usu_secundario_ose_user}
                            helperText={errors.usu_secundario_ose_user?.message}
                          />
                        )}
                      />
                    </Grid>
                    {/* Password OSE */}
                    <Grid item xs={4}>
                      Usuario password OSE:{" "}
                      <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="usu_secundario_ose_password"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.usu_secundario_ose_password}
                            helperText={
                              errors.usu_secundario_ose_password?.message
                            }
                          />
                        )}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    {/* Usuario SUNAT */}
                    <Grid item xs={4}>
                      Usuario SUNAT: <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="usu_secundario_user"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.usu_secundario_user}
                            helperText={errors.usu_secundario_user?.message}
                          />
                        )}
                      />
                    </Grid>
                    {/* Password SUNAT */}
                    <Grid item xs={4}>
                      Usuario password SUNAT:{" "}
                      <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="usu_secundario_password"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.usu_secundario_password}
                            helperText={errors.usu_secundario_password?.message}
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </>
            ) : (
              // Si es modo Beta aplica estas opciones
              <>
                {valuesWatch.ose_enabled && (
                  <>
                    <Grid item xs={4}>
                      Link OSE <strong className="text-danger">(BETA)</strong>:{" "}
                      <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="web_service"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.web_service}
                            helperText={errors.web_service?.message}
                          />
                        )}
                      />
                    </Grid>
                    {/* Usuario OSE */}
                    <Grid item xs={4}>
                      Usuario OSE{" "}
                      <strong className="text-danger">(BETA)</strong>:{" "}
                      <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="usu_secundario_ose_user"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.usu_secundario_ose_user}
                            helperText={errors.usu_secundario_ose_user?.message}
                          />
                        )}
                      />
                    </Grid>

                    {/* Password OSE */}
                    <Grid item xs={4}>
                      Usuario password OSE{" "}
                      <strong className="text-danger">(BETA)</strong>:{" "}
                      <strong className="text-danger">*</strong>
                    </Grid>

                    <Grid item xs={8}>
                      <Controller
                        name="usu_secundario_ose_password"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            {...field}
                            variant="filled"
                            error={!!errors.usu_secundario_ose_password}
                            helperText={
                              errors.usu_secundario_ose_password?.message
                            }
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </Grid>

        {valuesWatch.modo === 1 && (
          <Grid item xs={3}>
            <Stack spacing={1}>
              <Button
                fullWidth
                onClick={handleBrowseCertButtonClick}
                color="borderAux"
                variant="outlined"
                sx={{
                  height: 150,
                  width: "100%",
                }}
              >
                {(valuesWatch.cert?.length ?? 0) > 0 ? (
                  <img
                    src={
                      "https://solcainformatica.es/wp-content/uploads/certificados-instalados-ordenador.png"
                    }
                    alt="Certificado Preview"
                    className="w-[100%] h-[100%] object-contain block m-auto"
                  />
                ) : (
                  <WorkspacePremiumIcon
                    sx={{ height: "100%", width: "100%" }}
                  />
                )}
              </Button>
              <span className="text-center">{valuesWatch.cert?.[0].name}</span>
              <Controller
                name="cert"
                control={control}
                render={({ field }) => (
                  <InputFile
                    variant="text"
                    color="secondary"
                    title="Subir certificado"
                    other={{
                      ...field,
                      inputProps: { accept: ".pfx;*.p12" },
                      onChange: (e) => onChangeCert(e, field),
                      inputRef: (e) => {
                        refCert.current = e;
                        field.ref(e);
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default EmpresaCreateConfiguraciones;
