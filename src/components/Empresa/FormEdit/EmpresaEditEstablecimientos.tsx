import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { IEmpresa } from "../../../interface/empresa.interface";
import { SelectSimple } from "../../Select/SelectSimple";
import {
  useDepartamentos,
  useDistritos,
  useProvincias,
} from "../../../hooks/useEntidades";
import { useRef, useState, ChangeEvent, useCallback, useMemo } from "react";
import InputText from "../../Material/Input/InputText";
import InputFile from "../../Material/Input/InputFile";

const EmpresaEditEstablecimientos = () => {
  const {
    control,
    setValue: setValueModel,
    getValues,
    formState: { errors },
  } = useFormContext<IEmpresa>();

  const valuesWatch = useWatch({
    control,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "establecimientos",
    keyName: "uuid",
    shouldUnregister: false,
  });

  const { isLoading: isLoadingDepartamentos, data: dataDepartamentos } =
    useDepartamentos();

  const [index, setIndex] = useState(0);
  const refLogo = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState({
    provincia: false,
    distrito: false,
  });

  const {
    isLoading: isLoadingProvincias,
    isFetching: isFetchingProvincias,
    data: dataProvincias,
  } = useProvincias();

  const {
    isLoading: isLoadingDistritos,
    isFetching: isFetchingDistritos,
    data: dataDistritos,
  } = useDistritos();

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

  const onChangeEntidad = useCallback(
    async (entidad: string, field: any, index: number, event: any) => {
      field.onChange(event);
      setIndex(index);

      switch (entidad) {
        case "DEPARTAMENTO": {
          setLoading({ ...loading, provincia: true });
          await new Promise((resolve) => setTimeout(resolve, 1000));

          //Obtenemos provincia
          const findLabelProvincia = listProvincias?.find(
            (item) => item.value === `${event.value}01`
          );

          setValueModel(`establecimientos.${index}.provincia`, {
            label: findLabelProvincia?.label || "-",
            value: findLabelProvincia ? `${event.value}01` : "-",
          });

          setLoading({ ...loading, distrito: true });
          await new Promise((resolve) => setTimeout(resolve, 1000));

          //Obtenemos distrito
          const findLabelDistrito = listDistritos?.find(
            (item) => item.value === `${event.value}0101`
          );
          setValueModel(`establecimientos.${index}.distrito`, {
            label: findLabelDistrito?.label || "-",
            value: findLabelDistrito ? `${event.value}0101` : "-",
          });
          setValueModel(
            `establecimientos.${index}.ubigeo`,
            findLabelDistrito ? `${event.value}0101` : "-"
          );

          break;
        }

        case "PROVINCIA": {
          setLoading({ ...loading, distrito: true });
          await new Promise((resolve) => setTimeout(resolve, 1000));

          //Obtenemos distrito
          const findLabel = listDistritos?.find(
            (item) => item.value === `${event.value}01`
          );
          setValueModel(`establecimientos.${index}.distrito`, {
            label: findLabel?.label || "-",
            value: findLabel ? `${event.value}01` : "-",
          });
          setValueModel(
            `establecimientos.${index}.ubigeo`,
            findLabel ? `${event.value}01` : "-"
          );
          break;
        }
        case "DISTRITO": {
          setValueModel(`establecimientos.${index}.ubigeo`, `${event.value}`);
          break;
        }
      }

      setLoading({ provincia: false, distrito: false });
    },
    [listDistritos, listProvincias, loading, setValueModel]
  );

  const onChangeFoto = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: any,
    index: number
  ) => {
    const files = (e.target as HTMLInputElement).files as FileList;

    if (files.length > 0) {
      if (files[0].type !== "image/png") {
        alert("Por favor, selecciona un archivo PNG.");
        setValueModel(`establecimientos.${index}.logo`, undefined);
      } else {
        //setValueModel("logo", files[0].name);
        field.onChange(files);
      }
    }
  };

  const addEstablecimiento = () => {
    return append({
      codigo: "",
      denominacion: getValues("razon_social"),
      departamento: {
        label: "-",
        value: "-",
      },
      provincia: {
        label: "-",
        value: "-",
      },
      distrito: {
        label: "-",
        value: "-",
      },
      direccion: "",
      ubigeo: "",
      status: true,
      new: true,
    });
  };

  const optionsStatus = [
    { value: true, label: "Activo" },
    { value: false, label: "Inactivo" },
  ];

  return (
    <>
      <p>
        Un establecimiento es una copia de tu empresa a la que puedes ponerle su
        propia dirección, logo, usuarios, etc. Puedes usar un establecimiento
        para otro local, punto de venta o para otro negocio que use el mismo
        RUC.
      </p>
      <div className={`flex justify-end mt-2`}>
        <button
          type="button"
          onClick={addEstablecimiento}
          className="border px-2 hover:bg-hover"
        >
          Agregar establecimientos
        </button>
      </div>

      {fields.map((item, i) => {
        const departamento =
          valuesWatch.establecimientos?.[i]?.departamento?.value || "-";

        const provincia =
          valuesWatch.establecimientos?.[i]?.provincia?.value || "-";

        return (
          <div key={item.uuid} className="w-full">
            <fieldset className="w-full border rounded-sm p-[8px] mb-2 relative">
              <legend className="p-[0_12px] dark:text-white">
                Establecimiento {i + 1}{" "}
              </legend>
              {item.new && (
                <span
                  onClick={() => remove(i)}
                  className="cursor-pointer absolute top-[-21px] right-[8px] text-primary bg-white pr-[5px] pl-[5px]"
                >
                  x
                </span>
              )}
              <div className="w-full flex flex-row gap-2 mb-2">
                <div className="flex w-1/2">
                  <div className="w-1/3">
                    <label>
                      Código: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      control={control}
                      name={`establecimientos.${i}.codigo`}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          variant="filled"
                          error={!!errors.establecimientos?.[i]?.codigo}
                          helperText={
                            errors.establecimientos?.[i]?.codigo?.message
                          }
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex w-1/2">
                  <div className="w-1/3">
                    <label>
                      Denominacion: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      control={control}
                      name={`establecimientos.${i}.denominacion`}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          variant="filled"
                          error={!!errors.establecimientos?.[i]?.denominacion}
                          helperText={
                            errors.establecimientos?.[i]?.denominacion?.message
                          }
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-row gap-2 mb-2">
                <div className="flex w-1/3">
                  <div className="w-1/3">
                    <label>
                      Departamento: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      name={`establecimientos.${i}.departamento`}
                      control={control}
                      render={({ field }) => (
                        <SelectSimple
                          {...field}
                          className="departamento-single"
                          classNamePrefix="select"
                          isSearchable={false}
                          isLoading={isLoadingDepartamentos}
                          onChange={(event) =>
                            onChangeEntidad("DEPARTAMENTO", field, i, event)
                          }
                          options={listDepartamentos}
                          error={!!errors.establecimientos?.[i]?.departamento}
                          helperText={
                            errors.establecimientos?.[i]?.departamento?.value
                              ?.message
                          }
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex w-1/3">
                  <div className="w-1/3">
                    <label>
                      Provincia: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      name={`establecimientos.${i}.provincia`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <SelectSimple
                            {...field}
                            className="provincia-single"
                            classNamePrefix="select"
                            isSearchable={false}
                            isDisabled={
                              index === i &&
                              (isLoadingProvincias ||
                                isFetchingProvincias ||
                                loading.provincia)
                            }
                            isLoading={
                              index === i &&
                              (isLoadingProvincias ||
                                isFetchingProvincias ||
                                loading.provincia)
                            }
                            loadingMessage={() => "Consulte departamento"}
                            onChange={(event) =>
                              onChangeEntidad("PROVINCIA", field, i, event)
                            }
                            options={listProvincias.filter((a) =>
                              a.value.startsWith(departamento)
                            )}
                            error={!!errors.establecimientos?.[i]?.provincia}
                            helperText={
                              errors.establecimientos?.[i]?.provincia?.value
                                ?.message
                            }
                          />
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="flex w-1/3">
                  <div className="w-1/3">
                    <label>
                      Distrito: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      name={`establecimientos.${i}.distrito`}
                      control={control}
                      render={({ field }) => (
                        <SelectSimple
                          {...field}
                          className="distrito-single"
                          classNamePrefix="select"
                          isSearchable={false}
                          isDisabled={
                            index === i &&
                            (isLoadingDistritos ||
                              isFetchingDistritos ||
                              loading.distrito)
                          }
                          isLoading={
                            index === i &&
                            (isLoadingDistritos ||
                              isFetchingDistritos ||
                              loading.distrito)
                          }
                          loadingMessage={() => "Consulte provincia"}
                          onChange={(event) =>
                            onChangeEntidad("DISTRITO", field, i, event)
                          }
                          options={listDistritos.filter((a) =>
                            a.value.startsWith(provincia)
                          )}
                          error={!!errors.establecimientos?.[i]?.distrito}
                          helperText={
                            errors.establecimientos?.[i]?.distrito?.value
                              ?.message
                          }
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
                      Direccion: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      control={control}
                      name={`establecimientos.${i}.direccion`}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          variant="filled"
                          error={!!errors.establecimientos?.[i]?.direccion}
                          helperText={
                            errors.establecimientos?.[i]?.direccion?.message
                          }
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex w-1/2">
                  <div className="w-1/3">
                    <label>Logo:</label>
                  </div>
                  <div className="w-2/3">
                    <span className="text-center break-words">
                      {valuesWatch.establecimientos?.[i]?.logo?.[0]?.name}
                    </span>
                    <Controller
                      name={`establecimientos.${i}.logo`}
                      control={control}
                      render={({ field }) => (
                        <InputFile
                          variant="text"
                          color="secondary"
                          title="Subir logo a sucursal"
                          other={{
                            ...field,
                            inputProps: { accept: ".png" },
                            onChange: (e) => onChangeFoto(e, field, i),
                            inputRef: (e) => {
                              refLogo.current = e;
                              field.ref(e);
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-row gap-2">
                <div className="flex w-1/2">
                  <div className="w-1/3">
                    <label>
                      Ubigeo: <strong className="text-primary">*</strong>
                    </label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      control={control}
                      name={`establecimientos.${i}.ubigeo`}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          variant="filled"
                          error={!!errors.establecimientos?.[i]?.ubigeo}
                          helperText={
                            errors.establecimientos?.[i]?.ubigeo?.message
                          }
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex w-1/2">
                  <div className="w-1/3">
                    <label>Estado:</label>
                  </div>
                  <div className="w-2/3">
                    <Controller
                      name={`establecimientos.${i}.status`}
                      control={control}
                      render={({ field }) => (
                        <SelectSimple
                          {...field}
                          className="status-single"
                          classNamePrefix="select"
                          isSearchable={false}
                          options={optionsStatus}
                          value={optionsStatus.find(
                            ({ value }) =>
                              value ===
                              valuesWatch.establecimientos?.[i]?.status
                          )}
                          onChange={(e: any) => {
                            setValueModel(
                              `establecimientos.${i}.status`,
                              e.value,
                              {
                                shouldDirty: true,
                              }
                            );
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        );
      })}
    </>
  );
};

export default EmpresaEditEstablecimientos;
