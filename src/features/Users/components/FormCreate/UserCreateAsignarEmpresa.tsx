import { Grid } from "@mui/material";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { IError } from "../../../../interfaces/common/error.interface";
import InputCheckBox from "../../../../components/Material/Input/InputCheckBox";
import { IUser } from "../../../../interfaces/models/user/user.interface";

interface Props {
  isLoading: boolean;
  error: IError | null;
}

const UserCreateAsignarEmpresa = ({ isLoading, error }: Props) => {
  const { control, getValues, setValue } = useFormContext<IUser>();

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
                      <label className="flex gap-[2px] cursor-pointer items-center">
                        <Controller
                          name={`empresasAsign.${indexEmpresa}.checked`}
                          control={control}
                          render={({ field }) => (
                            <InputCheckBox
                              {...field}
                              disabled={!empresa.estado}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(checked);

                                //Si una empresa esta marcada se debe marcar minimo por defecto un establecimiento
                                if (checked) {
                                  setValue(
                                    `empresasAsign.${indexEmpresa}.establecimientos.${0}.checked`,
                                    true
                                  );
                                } else {
                                  //Si la empresa esta desmarcada, se desmarcan todos los establecimientos
                                  const establecimientosEmpresa = getValues(
                                    `empresasAsign.${indexEmpresa}.establecimientos`
                                  );
                                  establecimientosEmpresa.forEach(
                                    (_, indexChecked) => {
                                      setValue(
                                        `empresasAsign.${indexEmpresa}.establecimientos.${indexChecked}.checked`,
                                        false
                                      );
                                    }
                                  );
                                }
                              }}
                            />
                          )}
                        />
                        {empresa.razon_social}
                      </label>
                      {empresa.establecimientos?.map(
                        (establecimiento, indexEstablecimiento) => {
                          return (
                            <label
                              key={establecimiento.id}
                              className="ml-5 flex gap-[2px] text-[11px] cursor-pointer items-center"
                            >
                              <Controller
                                name={`empresasAsign.${indexEmpresa}.establecimientos.${indexEstablecimiento}.checked`}
                                control={control}
                                render={({ field }) => (
                                  <InputCheckBox
                                    {...field}
                                    disabled={
                                      !empresa.estado || !establecimiento.estado
                                    }
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      field.onChange(checked);
                                      //Si un establecimiento esta marcado se debe marcar por defecto la empresa
                                      if (checked) {
                                        setValue(
                                          `empresasAsign.${indexEmpresa}.checked`,
                                          true
                                        );
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

                                        if (
                                          establecimientosCheckedsFiltered.length ===
                                          0
                                        ) {
                                          setValue(
                                            `empresasAsign.${indexEmpresa}.checked`,
                                            false
                                          );
                                        }
                                      }
                                    }}
                                  />
                                )}
                              />
                              {`${establecimiento.codigo} - ${establecimiento.denominacion}`}
                            </label>
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

export default UserCreateAsignarEmpresa;
