import { Grid } from "@mui/material";
import { useFormContext, useFieldArray } from "react-hook-form";
import { IError } from "../../../../interfaces/common/error.interface";
import { IUser } from "../../../../interfaces/models/user/user.interface";

interface Props {
  isLoading: boolean;
  error: IError | null;
}

const UserEditAsignarEmpresa = ({ isLoading, error }: Props) => {
  const { control, getValues, setValue, register } = useFormContext<IUser>();

  const { fields } = useFieldArray({
    control,
    name: "empresasAsign",
    keyName: "uuid",
    shouldUnregister: false,
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={9} container>
        <Grid item xs={4}>
          Asignar empresas: <strong className="text-danger">*</strong>
        </Grid>
        <Grid item container xs={8}>
          <Grid item xs={12}>
            {isLoading ? (
              <span className="w-full">Cargando empresas asignadas...</span>
            ) : error ? (
              <span className="text-red-500 w-full">
                {error.response.data.message}
              </span>
            ) : fields.length === 0 ? (
              "No tienes ninguna empresa asignada."
            ) : (
              fields.map((empresa, indexEmpresa) => {
                return (
                  <div key={empresa.uuid} className="border p-2 mb-2">
                    <div className="flex flex-col">
                      <label className="flex gap-[2px] cursor-pointer">
                        <input
                          disabled={!empresa.estado}
                          type="checkbox"
                          {...register(
                            `empresasAsign.${indexEmpresa}.checked`,
                            {
                              onChange: (e) => {
                                const checked = e.target.checked;
                                //Si una empresa esta marcada se debe marcar minimo por defecto un establecimiento
                                if (checked) {
                                  setValue(
                                    `empresasAsign.${indexEmpresa}.establecimientos.${0}.checked`,
                                    true
                                  );
                                  setValue(
                                    `empresasAsign.${indexEmpresa}.establecimientos.${0}.pos.${0}.checked`,
                                    true
                                  );
                                } else {
                                  //Si la empresa esta desmarcada, se desmarcan todos los establecimientos
                                  const establecimientosEmpresa = getValues(
                                    `empresasAsign.${indexEmpresa}.establecimientos`
                                  );
                                  establecimientosEmpresa.forEach(
                                    (establecimiento, indexChecked) => {
                                      setValue(
                                        `empresasAsign.${indexEmpresa}.establecimientos.${indexChecked}.checked`,
                                        false
                                      );

                                      //Si la empresa esta desmarcada, se desmarcan todos los POS
                                      establecimiento.pos.forEach(
                                        (_, indexPos) => {
                                          setValue(
                                            `empresasAsign.${indexEmpresa}.establecimientos.${indexChecked}.pos.${indexPos}.checked`,
                                            false
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              },
                            }
                          )}
                        />
                        {empresa.razon_social}
                      </label>
                      {empresa.establecimientos?.map(
                        (establecimiento, indexEstablecimiento) => {
                          return (
                            <div key={establecimiento.id}>
                              <label className="ml-5 flex gap-[2px] text-[11px] cursor-pointer">
                                <input
                                  disabled={
                                    !empresa.estado || !establecimiento.estado
                                  }
                                  type="checkbox"
                                  {...register(
                                    `empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.checked`,
                                    {
                                      onChange: (e) => {
                                        const checked = e.target.checked;
                                        //Si un establecimiento esta marcado se debe marcar por defecto la empresa
                                        if (checked) {
                                          setValue(
                                            `empresasAsign.${indexEmpresa}.checked`,
                                            true
                                          );

                                          // Si marcamos un establecimiento se debe marca por defecto el primer POS
                                          if (establecimiento.pos.length > 0) {
                                            setValue(
                                              `empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.pos.${Number(0)}.checked`,
                                              true
                                            );
                                          }
                                        } else {
                                          //Si todos los establecimentos estan desmarcados, se desmarca la empresa
                                          const establecimientosEmpresa =
                                            getValues(
                                              `empresasAsign.${indexEmpresa}.establecimientos`
                                            );
                                          const establecimientosCheckedsFiltered =
                                            establecimientosEmpresa.filter(
                                              (est) => est.checked === true
                                            );

                                          //Si todos los establecimentos estan desmarcados, se desmarca la empresa
                                          if (
                                            establecimientosCheckedsFiltered.length ===
                                            0
                                          ) {
                                            setValue(
                                              `empresasAsign.${indexEmpresa}.checked`,
                                              false
                                            );
                                          }

                                          //Si desmarcamos un establecimiento, se desmarcan todos los POS
                                          if (establecimiento.pos.length > 0) {
                                            establecimiento.pos.forEach(
                                              (_, indexPos) => {
                                                setValue(
                                                  `empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.pos.${indexPos}.checked`,
                                                  false
                                                );
                                              }
                                            );
                                          }
                                        }
                                      },
                                    }
                                  )}
                                />
                                {`${establecimiento.codigo} - ${establecimiento.denominacion}`}
                              </label>
                              {establecimiento.pos?.map((pos, indexPos) => {
                                return (
                                  <label
                                    key={pos.id}
                                    className="ml-10 flex gap-[2px] text-[11px] cursor-pointer"
                                  >
                                    <input
                                      disabled={
                                        !empresa.estado ||
                                        !establecimiento.estado ||
                                        !pos.estado
                                      }
                                      type="checkbox"
                                      {...register(
                                        `empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.pos.${indexPos}.checked`,
                                        {
                                          onChange: (e) => {
                                            const checked = e.target.checked;
                                            //Si un POS esta marcado se debe marcar por defecto el establecimiento y la empresa
                                            if (checked) {
                                              setValue(
                                                `empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.checked`,
                                                true
                                              );
                                              setValue(
                                                `empresasAsign.${indexEmpresa}.checked`,
                                                true
                                              );
                                            } else {
                                              //Si todos los POS estan desmarcados, se desmarca el establecimiento
                                              const posEstablecimiento =
                                                getValues(
                                                  `empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.pos`
                                                );
                                              const posCheckedsFiltered =
                                                posEstablecimiento.filter(
                                                  (pos) => pos.checked === true
                                                );

                                              //Si todos los POS estan desmarcados, se desmarca el establecimiento
                                              if (
                                                posCheckedsFiltered.length === 0
                                              ) {
                                                setValue(
                                                  `empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.checked`,
                                                  false
                                                );
                                                setValue(
                                                  `empresasAsign.${indexEmpresa}.checked`,
                                                  false
                                                );
                                              }
                                            }
                                          },
                                        }
                                      )}
                                    />
                                    {`${pos.codigo} - ${pos.nombre}`}
                                  </label>
                                );
                              })}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default UserEditAsignarEmpresa;
