/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { getPersona } from "../../../api/ext";
import { SelectSimple } from "../../Select/SelectSimple";
import {
  useDepartamentos,
  useDistritos,
  useProvincias,
} from "../../../hooks/useEntidades";
import { useState, useRef, ChangeEvent, useMemo } from "react";
import { Button, Grid, Stack } from "@mui/material";
import InputText from "../../Material/Input/InputText";
import SearchIcon from "@mui/icons-material/Search";
import { isError } from "../../../utils/functions";
import { toast } from "react-toastify";
import CachedIcon from "@mui/icons-material/Cached";
import ImageIcon from "@mui/icons-material/Image";
import InputFile from "../../Material/Input/InputFile";
import { useUsersEmpresa } from "../../../hooks/useEmpresa";
import { IEmpresa } from "../../../interface/empresa.interface";

let imagePreview = "";

const EmpresaCreateGeneral = () => {
  const {
    control,
    getValues,
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

  const { isLoading: isLoadingDepartamentos, data: dataDepartamentos } =
    useDepartamentos();

  const { data: dataProvincias, isLoading: isLoadingProvincias } =
    useProvincias();

  const { data: dataDistritos, isLoading: isLoadingDistritos } = useDistritos();

  const [isLoadingRuc, setLoadingRuc] = useState<boolean>(false);
  const refLogo = useRef<HTMLInputElement | null>(null);

  const handleBrowseLogoButtonClick = () => {
    if (refLogo.current) {
      return refLogo?.current?.click();
    }
  };

  const listDepartamentos = useMemo(() => {
    return (
      dataDepartamentos
        ?.map((item) => ({
          value: item.id,
          label: item.departamento,
        }))
        .concat({ value: "-", label: "-" }) || []
    );
  }, [dataDepartamentos]);

  const listProvincias = useMemo(() => {
    return (
      dataProvincias
        ?.map((item) => ({
          value: item.id,
          label: item.provincia,
        }))
        .concat({ value: "-", label: "-" }) || []
    );
  }, [dataProvincias]);

  const listDistritos = useMemo(() => {
    return (
      dataDistritos
        ?.map((item) => ({
          value: item.id,
          label: item.distrito,
        }))
        .concat({ value: "-", label: "-" }) || []
    );
  }, [dataDistritos]);

  const listUsuarios =
    dataUsers?.map((item) => ({
      value: item.id,
      label: `${item.id} - ${item.usuario}`,
      disabled: !item.estado,
    })) || [];

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

  const obtenerDepartamento = async (departamento: string) => {
    const findDepartamento =
      listDepartamentos &&
      listDepartamentos.find((dtp) => dtp.label === departamento);

    const queryDpto = findDepartamento
      ? findDepartamento
      : { value: "-", label: "-" };

    setValueModel("departamento", queryDpto);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return queryDpto;
  };

  const obtenerProvincia = async (provincia: string) => {
    const findProvincia =
      listProvincias && listProvincias.find((dtp) => dtp.label === provincia);

    const queryPrv = findProvincia ? findProvincia : { value: "-", label: "-" };

    setValueModel("provincia", queryPrv);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return queryPrv;
  };

  const obtenerDistrito = async (distrito: string) => {
    const findDistrito =
      listDistritos && listDistritos.find((dtp) => dtp.label === distrito);

    const queryDsto = findDistrito ? findDistrito : { value: "-", label: "-" };

    setValueModel("distrito", queryDsto);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return queryDsto;
  };

  const buscarRUC = async () => {
    setLoadingRuc(true);
    try {
      if (!getValues("ruc")) {
        toast.error("Ingrese RUC");
        return setLoadingRuc(false);
      }
      const entidad = await getPersona("ruc", getValues("ruc"));
      const { departamento, provincia, distrito, ubigeo } = entidad;
      setValueModel("razon_social", entidad.razonSocial);
      setValueModel("nombre_comercial", entidad.nombre);
      setValueModel("domicilio_fiscal", entidad.direccion);
      await obtenerDepartamento(departamento);
      await obtenerProvincia(provincia);
      await obtenerDistrito(distrito);
      setValueModel("ubigeo", ubigeo);
      setValueModel("urbanizacion", "-");
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
    setLoadingRuc(false);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={9} container>
          {/* Usuario */}
          <Grid item xs={4}>
            Usuario: <strong className="text-primary">*</strong>
          </Grid>
          <Grid item container xs={8}>
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
                      isOptionDisabled={(option) => Boolean(option.disabled)}
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
                    />
                  );
                }}
              />
            </Grid>
          </Grid>

          {/* Ruc */}
          <Grid item xs={4}>
            Ruc: <strong className="text-primary">*</strong>
          </Grid>
          <Grid item container xs={8}>
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
                  />
                )}
              />
            </Grid>
            <Grid item>
              {isLoadingRuc ? (
                <CachedIcon className="animate-spin" />
              ) : (
                <SearchIcon className="cursor-pointer" onClick={buscarRUC} />
              )}
            </Grid>
          </Grid>
          {/* Razon social */}
          <Grid item xs={4}>
            Razon social: <strong className="text-primary">*</strong>
          </Grid>
          <Grid item container xs={8}>
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
                  />
                )}
              />
            </Grid>
          </Grid>
          {/* Nombre comercial */}
          <Grid item xs={4}>
            Nombre comercial: <strong className="text-primary">*</strong>
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
            Domicilio fiscal: <strong className="text-primary">*</strong>
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
          {/* Departamento */}
          <Grid item xs={4}>
            Departamento:
          </Grid>
          <Grid item container xs={8}>
            <Grid item xs={8}>
              <Controller
                name="departamento"
                control={control}
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    placeholder=""
                    className="departamento-single"
                    classNamePrefix="select"
                    isDisabled
                    isSearchable={false}
                    isLoading={isLoadingDepartamentos || isLoadingRuc}
                    options={listDepartamentos}
                    // value={listDepartamentos.find(
                    //   ({ value }) => value === valuesWatch.departamento?.value
                    // )}
                    // onChange={(e: any) =>
                    //   setValueModel("departamento", e)
                    // }
                  />
                )}
              />
            </Grid>
          </Grid>
          {/* Provincia */}
          <Grid item xs={4}>
            Provincia:
          </Grid>
          <Grid item container xs={8}>
            <Grid item xs={8}>
              <Controller
                name="provincia"
                control={control}
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    placeholder=""
                    className="provincia-single"
                    classNamePrefix="select"
                    isDisabled
                    isSearchable={false}
                    isLoading={isLoadingRuc || isLoadingProvincias}
                    options={listProvincias}
                    // value={listProvincias.find(
                    //   ({ value }) => value === valuesWatch.provincia
                    // )}
                    // onChange={(e: any) => setValueModel("provincia", e)}
                  />
                )}
              />
            </Grid>
          </Grid>
          {/* Distrito */}
          <Grid item xs={4}>
            Distrito:
          </Grid>
          <Grid item container xs={8}>
            <Grid item xs={8}>
              <Controller
                name="distrito"
                control={control}
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    placeholder=""
                    className="distrito-single"
                    classNamePrefix="select"
                    isDisabled
                    isSearchable={false}
                    isLoading={isLoadingRuc || isLoadingDistritos}
                    options={listDistritos}
                    // value={listDistritos.find(
                    //   ({ value }) => value === valuesWatch.distrito
                    // )}
                    // onChange={(e: any) => setValueModel("distrito", e)}
                  />
                )}
              />
            </Grid>
          </Grid>
          {/* Ubigeo */}
          <Grid item xs={4}>
            Ubigeo: <strong className="text-primary">*</strong>
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
            Urbanizacion: <strong className="text-primary">*</strong>
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
              {(valuesWatch.logo?.length || 0) > 0 ? (
                <img
                  src={imagePreview}
                  alt="Logo Preview"
                  className="w-[100%] h-[100%] object-contain block m-auto"
                />
              ) : (
                <ImageIcon sx={{ height: "100%", width: "100%" }} />
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

export default EmpresaCreateGeneral;
