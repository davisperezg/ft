import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import InputText from "../../../../components/Material/Input/InputText";
import { IFeatureEmpresaUpdate } from "../../../../interfaces/features/empresa/empresa.interface";
import { useEstablecimientosByEmpresa } from "../../hooks/useEmpresa";
import { SelectSimple } from "../../../../components/common/Selects/SelectSimple";

const EmpresaEditPOS = ({ id }: { id: number }) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<IFeatureEmpresaUpdate>();

  const valuesWatch = useWatch({
    control,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pos",
    keyName: "uuid",
    shouldUnregister: false,
  });

  const { data: listEstablishment, isPending } =
    useEstablecimientosByEmpresa(id);

  const addPOS = (establecimiento: any, establishmentPOS: any[]) => {
    append({
      id: undefined,
      nombre:
        establishmentPOS.length === 0
          ? `POS Principal - ${establecimiento.codigo}`
          : "",
      codigo: establishmentPOS.length === 0 ? "001" : "",
      establecimiento: {
        id: establecimiento.id,
        codigo: establecimiento.codigo,
        denominacion: establecimiento.denominacion,
      },
      new: true,
      estado: true,
    });
  };

  const deletePOS = (index: number) => remove(index);

  // Agrupar los POS por establecimiento
  const getPOSByEstablishment = (establecimientoId: number) => {
    return fields.filter(
      (pos) =>
        pos.establecimiento && pos.establecimiento.id === establecimientoId
    );
  };

  const optionsStatus = [
    { value: true, label: "Activo" },
    { value: false, label: "Inactivo" },
  ];

  console.log(valuesWatch);

  return (
    <div>
      {isPending ? (
        "Cargando establecimiento..."
      ) : (
        <div>
          <div className="w-full flex justify-end mb-2 font-bold">
            Total de establecimientos: {listEstablishment?.length}
          </div>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border py-1 px-2 w-[40%]">Establecimientos</th>
                <th className="border py-1 px-2 w-auto">Puntos de venta</th>
              </tr>
            </thead>
            <tbody>
              {listEstablishment?.map((est, indexEst) => {
                // Obtener solo los POS para este establecimiento
                const establishmentPOS = getPOSByEstablishment(Number(est.id));

                return (
                  <tr key={indexEst}>
                    <th className="border py-1 px-2 font-normal">
                      {est.codigo === "0000" ? "PRINCIPAL" : est.codigo} -{" "}
                      {est.denominacion}
                    </th>
                    <th className="border py-2 px-2">
                      {establishmentPOS.map((item, posIndex) => {
                        // Encontrar el índice real en el array fields para usar en Controller
                        const realIndex = fields.findIndex(
                          (f) => f.uuid === item.uuid
                        );

                        return (
                          <div key={item.uuid} className="w-full">
                            <fieldset className="w-full border rounded-sm p-[8px] mb-2 relative">
                              <legend className="p-[0_12px] dark:text-white">
                                POS {posIndex + 1}
                              </legend>
                              {item.new && (
                                <span
                                  onClick={() => deletePOS(realIndex)}
                                  className="cursor-pointer absolute top-[-21px] right-[8px] text-danger bg-white pr-[5px] pl-[5px]"
                                >
                                  x
                                </span>
                              )}
                              <div className="w-full flex flex-row gap-2 mb-2">
                                <div className="flex w-1/4">
                                  <Controller
                                    control={control}
                                    name={`pos.${realIndex}.codigo`}
                                    render={({ field }) => (
                                      <InputText
                                        {...field}
                                        disabled={
                                          posIndex === 0 &&
                                          item.codigo === "001"
                                        }
                                        placeholder="Código"
                                        variant="filled"
                                        error={
                                          !!errors.pos?.[realIndex]?.codigo
                                        }
                                        helperText={
                                          errors.pos?.[realIndex]?.codigo
                                            ?.message
                                        }
                                      />
                                    )}
                                  />
                                </div>
                                <div className="flex w-3/4">
                                  <Controller
                                    control={control}
                                    name={`pos.${realIndex}.nombre`}
                                    render={({ field }) => (
                                      <InputText
                                        {...field}
                                        disabled={
                                          posIndex === 0 &&
                                          item.codigo === "001"
                                        }
                                        placeholder="Nombre"
                                        variant="filled"
                                        error={
                                          !!errors.pos?.[realIndex]?.nombre
                                        }
                                        helperText={
                                          errors.pos?.[realIndex]?.nombre
                                            ?.message
                                        }
                                      />
                                    )}
                                  />
                                </div>
                                <div className="flex w-auto">
                                  <Controller
                                    name={`pos.${realIndex}.estado`}
                                    control={control}
                                    render={({ field }) => (
                                      <SelectSimple
                                        {...field}
                                        isDisabled={
                                          posIndex === 0 &&
                                          item.codigo === "001"
                                        }
                                        className="status-single"
                                        classNamePrefix="select"
                                        isSearchable={false}
                                        options={optionsStatus}
                                        value={optionsStatus.find(
                                          ({ value }) =>
                                            value ===
                                            valuesWatch.pos?.[realIndex]?.estado
                                        )}
                                        onChange={(e: any) => {
                                          setValue(
                                            `pos.${realIndex}.estado`,
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
                            </fieldset>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => addPOS(est, establishmentPOS)}
                        className="border px-2 hover:bg-bgDefault font-normal"
                      >
                        Agregar POS
                      </button>
                    </th>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmpresaEditPOS;
