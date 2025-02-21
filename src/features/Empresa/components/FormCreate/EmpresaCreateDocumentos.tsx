import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { useTipoDocs } from "../../../TiposDocsCpes/hooks/useTipoDocs";
import { Grid } from "@mui/material";
import { SelectSimple } from "../../../../components/common/Selects/SelectSimple";
import { IFeatureEmpresaCreate } from "../../../../interfaces/features/empresa/empresa.interface";

const EmpresaCreateDocumentos = () => {
  const {
    data: dataTipdocs,
    error: errorTipdocs,
    isLoading: isLoadingTipdocs,
    isError: isErrorTipdocs,
  } = useTipoDocs();

  const { control, setValue: setValueModel } =
    useFormContext<IFeatureEmpresaCreate>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documentos",
    keyName: "uuid",
  });

  const valuesWatch = useWatch({
    control,
  });

  const listDocs =
    dataTipdocs?.map((item) => ({
      value: Number(item.id),
      label: `${item.codigo} - ${item.nombre}`,
      disabled: !item.status,
    })) ?? [];

  const appendDocumento = () => {
    const documento = listDocs
      .map((doc) => ({ ...doc, value: Number(doc.value) }))
      .find((item) => item.value === valuesWatch.tip_documento);

    //Si encuentra un documento agregamos
    if (documento) {
      //Evitar agregar duplicado
      const foundDoc = fields.some((item) => item.id === documento.value);

      if (foundDoc) {
        alert("El documento ya está agregado. ");
        return;
      }

      return append({ id: documento.value, nombre: documento.label });
    }

    alert("Seleccione un tipo de documento para agregar.");
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <div className="pl-[16px] pt-[10px]">
              <span>Tipo de documento:</span>
            </div>
          </Grid>
          <Grid item xs={4}>
            <div className="pt-[10px]">
              <Controller
                control={control}
                name="tip_documento"
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    className="tipdocs-single"
                    classNamePrefix="select"
                    isSearchable={false}
                    isLoading={isLoadingTipdocs}
                    options={listDocs}
                    isOptionDisabled={(option) => Boolean(option.disabled)}
                    placeholder="Seleccione documento"
                    error={isErrorTipdocs}
                    helperText={errorTipdocs?.response.data.message}
                    value={listDocs.find(
                      ({ value }) => Number(value) === valuesWatch.tip_documento
                    )}
                    onChange={(e: any) =>
                      setValueModel("tip_documento", e.value)
                    }
                  />
                )}
              />
            </div>
          </Grid>
          <Grid item xs={4}>
            <Grid container justifyContent="flex-end" alignItems="flex-end">
              <div className="pt-[2px] w-full flex justify-end">
                <button
                  onClick={appendDocumento}
                  className="flex items-center justify-center h-[20px] hover:bg-bgDefault text-center w-1/3"
                  type="button"
                >
                  Agregar
                </button>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid container className="ml-[16px]">
          {fields.length > 0 && (
            <>
              <div className="w-full flex flex-row mt-10 ">
                <strong>Documentos asignados:</strong>
              </div>
              <div className="w-full flex flex-col">
                {fields.map((item, index) => {
                  return (
                    <div
                      key={index + 1}
                      className={`w-full flex gap-1 ${
                        index === 0 ? "mt-3 py-1" : "py-1"
                      } border-t`}
                    >
                      <div className="w-1/12 flex justify-center items-center">
                        <strong>{index + 1}</strong>
                      </div>
                      <div className="w-8/12 flex justify-center items-center">
                        {item.nombre}
                      </div>
                      <div className="w-3/12 flex">
                        <button
                          type="button"
                          className="w-full h-8 border border-danger text-danger"
                          onClick={() => remove(index)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EmpresaCreateDocumentos;
