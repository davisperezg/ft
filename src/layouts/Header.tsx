import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo_systemfact.png";
import { ModalContext } from "../store/context/dialogContext";
import { storage } from "../utils/storage.utils";
import { PageEnum } from "../types/enums/page.enum";
import {
  IAuthEmpresa,
  IAuthEmpresas,
  IAuthEstablecimiento,
  IAuthPayload,
} from "../interfaces/models/auth/auth.interface";
import { useUserStore } from "../store/zustand/user-zustand";
import { PageContext } from "../store/context/pageContext";

interface IHeader {
  result: IAuthPayload | undefined;
}

const Header = ({ result }: IHeader) => {
  const { dialogState } = useContext(PageContext);
  const setUserGlobal = useUserStore((state) => state.setUserGlobal);
  const userGlobal = useUserStore((state) => state.userGlobal);
  const [isDropdown, setDropdown] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);
  const [selectedOption, setSelectedOption] = useState("");
  //const [empresaActual, setEmpresaActual] = useState<IAuthEmpresa | null>(null);
  //const [establecimientoActual, setEstablecimientoActual] =
  useState<IAuthEstablecimiento | null>(null);
  const [EMPRESAS_ASIGNADAS, setEmpresasAsignadas] = useState<IAuthEmpresas[]>(
    []
  );
  const [EMPRESAS_INACTIVAS, setEmpresasInactivas] = useState<boolean | null>(
    null
  );
  // const [ESTABLECIMIENTOS_ASIGNADOS, setEstablecimientosAsignadas] = useState<
  //   IAuthEstablecimiento[]
  // >([]);
  const [ESTABLECIMIENTOS_INACTIVOS, setEstablecimientosInactivos] = useState<
    boolean | null
  >(null);

  const closeApp = () => {
    storage.clear("SESSION");
    location.reload();
  };

  const handleDropdown = () => {
    setDropdown(!isDropdown);
  };

  // Allow for outside click
  useEffect(() => {
    function handleOutsideClick(event: any) {
      if (!labelRef.current?.contains(event.target)) {
        if (!isDropdown) return;
        setDropdown(false);
      }
    }

    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isDropdown, labelRef, setDropdown]);

  // Allow to use the `esc` key
  useEffect(() => {
    function handleEscape(event: any) {
      if (!isDropdown) return;

      if (event.key === "Escape") {
        setDropdown(false);
      }
    }

    document.addEventListener("keyup", handleEscape);
    return () => document.removeEventListener("keyup", handleEscape);
  }, [isDropdown, setDropdown]);

  useEffect(() => {
    if (result) {
      setUserGlobal(result);

      const empresasAsignadas = result.empresas;

      if (empresasAsignadas && empresasAsignadas?.length > 0) {
        setEmpresasAsignadas(empresasAsignadas);

        const hayEmpresasInactivas = empresasAsignadas.every(
          (emp) => !emp.estado
        );
        setEmpresasInactivas(hayEmpresasInactivas);

        const empresaStorage = sessionStorage.getItem("empresaActual");

        // Si ya existe una empresa seleccionada por defecto
        if (empresaStorage) {
          const empresaSeleccion = JSON.parse(
            String(empresaStorage)
          ) as IAuthEmpresa;

          const { id, establecimiento } = empresaSeleccion;

          if (!selectedOption) {
            setSelectedOption(
              `idEmpresa:${id},idEstablecimiento:${establecimiento?.id}`
            );
          }

          const empresaData = empresasAsignadas?.find(
            (emp) => emp.id === empresaSeleccion?.id
          ) as IAuthEmpresas;
          //setEmpresaActual(empresaData);

          const establecimientosAsignadas =
            empresaData?.establecimientos as IAuthEstablecimiento[];
          //setEstablecimientosAsignadas(establecimientosAsignadas);

          const hayEstablecimientosInactivas = establecimientosAsignadas?.every(
            (emp) => !emp.estado
          );
          setEstablecimientosInactivos(Boolean(hayEstablecimientosInactivas));

          // Si un establecimiento esta desactivado tomara uno por defecto
          const establecimientoSeleccionado = empresaSeleccion?.establecimiento;

          if (!establecimientoSeleccionado) {
            sessionStorage.removeItem("empresaActual");
            return;
          }

          const establecimientoData = establecimientosAsignadas?.find(
            (est) => est.id === establecimientoSeleccionado?.id
          ) as IAuthEstablecimiento;
          //setEstablecimientoActual(establecimientoData);

          // Si todos los establecimientos estan desactivados
          if (establecimientosAsignadas?.every((est) => !est.estado)) {
            sessionStorage.removeItem("empresaActual");
            return;
          } else {
            // Buscara otro establecimiendo con estado activo y lo tomara por defecto
            if (!establecimientoData.estado) {
              sessionStorage.removeItem("empresaActual");
              window.location.reload();
              return;
            }
          }
          // Fin Si un establecimiento esta desactivado tomara uno por defecto

          setUserGlobal({
            ...result,
            empresaActual:
              { ...empresaSeleccion, establecimiento: establecimientoData } ??
              null,
          });

          sessionStorage.setItem(
            "empresaActual",
            JSON.stringify(
              { ...empresaSeleccion, establecimiento: establecimientoData } ??
                null
            )
          );
        } else {
          // Si no existe una empresa por defecto, se asignara una
          if (result.empresaActual) {
            const empresaDefault = result.empresaActual as IAuthEmpresa;
            //setEmpresaActual(empresaDefault);

            setSelectedOption(
              `idEmpresa:${empresaDefault?.id},idEstablecimiento:${empresaDefault?.establecimiento?.id}`
            );

            sessionStorage.setItem(
              "empresaActual",
              JSON.stringify(empresaDefault)
            );
          }
          // else {
          //   setEmpresaActual(null);
          // }
        }
      }
    }
  }, [result, selectedOption, setUserGlobal]);

  const obtenerValoresSelect = (selectedValue: string) => {
    // Dividir el string en partes usando la coma como separador
    const partes: string[] = selectedValue.split(",");

    // Inicializar objetos para almacenar los valores
    const valores: Record<string, number> = {};

    // Iterar sobre las partes
    partes.forEach((parte: string) => {
      // Dividir cada parte en clave y valor usando ":" como separador
      const [clave, valor] = parte.split(":");

      // Almacenar el valor en el objeto
      valores[clave] = parseInt(valor); // Convertir el valor a un número entero
    });

    // Retorna los valores específicos
    return valores;
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;

    const valores = obtenerValoresSelect(selectedValue);
    const idEmpresa = valores.idEmpresa;
    const idEstablecimiento = valores.idEstablecimiento;

    const getEmpresa = EMPRESAS_ASIGNADAS?.find(
      (empresa: any) => empresa.id === idEmpresa
    );

    const getEstablecimiento = getEmpresa?.establecimientos?.find(
      (est: any) => est.id === idEstablecimiento
    );

    if (getEmpresa) {
      const { establecimientos: _, ...rest } = getEmpresa;

      const empresaNueva = {
        ...rest,
        establecimiento: getEstablecimiento,
      };

      const cambiar = confirm("Estas seguro que quieres cambiar de sucursal?");
      if (cambiar) {
        setSelectedOption(selectedValue);
        sessionStorage.setItem("empresaActual", JSON.stringify(empresaNueva));
        location.reload();
      }
    }
  };

  return (
    <>
      {/* absolute */}
      <header
        className={`bg-white w-full flex h-[60px] p-[10px] dark:bg-gray-700 ${
          dialogState.pageComplete &&
          dialogState.namePage === PageEnum.SCREEN_FACTURA
            ? "shadow-lg z-[1] fixed"
            : "relative"
        }`}
      >
        <div className={`w-full flex justify-between`}>
          <h1 className="font-bold dark:text-white text-">
            <img src={logo} width={130} height={50} />
          </h1>
          <div className="flex flex-row select-none">
            {EMPRESAS_ASIGNADAS?.length === 0 ? (
              (!userGlobal?.empresas && !userGlobal?.empresaActual) || (
                <div className="mr-[20px]">
                  <span className="text-danger font-medium">
                    Usted no pertenece a ninguna empresa.
                  </span>
                </div>
              )
            ) : EMPRESAS_INACTIVAS ? (
              <div className="mr-[20px]">
                <span className="text-danger font-medium">
                  Tus empresas estan inactivas.
                </span>
              </div>
            ) : (
              ESTABLECIMIENTOS_INACTIVOS && (
                <div className="mr-[20px]">
                  <span className="text-danger font-medium">
                    Tus establecimientos estan inactivos.
                  </span>
                </div>
              )
            )}

            {!EMPRESAS_ASIGNADAS ||
              EMPRESAS_ASIGNADAS?.length === 0 ||
              EMPRESAS_INACTIVAS ||
              ESTABLECIMIENTOS_INACTIVOS || (
                <>
                  <div className="mr-[20px] w-[150px]">
                    <select
                      className="w-full cursor-pointer border outline-none"
                      onChange={handleSelectChange}
                      value={selectedOption}
                    >
                      {EMPRESAS_ASIGNADAS?.map((item) => {
                        return (
                          <optgroup
                            key={item.ruc}
                            label={`${item.nombre_comercial} - ${
                              item.estado ? "Activo" : "Inactivo"
                            }`}
                          >
                            {item.establecimientos?.map((est) => {
                              return (
                                <option
                                  key={est.id}
                                  disabled={!est.estado || !item.estado}
                                  value={`idEmpresa:${item.id},idEstablecimiento:${est.id}`}
                                >
                                  {`${est.codigo} - ${est.denominacion} -
                                ${
                                  item.estado && est.estado
                                    ? "Activo"
                                    : "Inactivo"
                                }`}
                                </option>
                              );
                            })}
                          </optgroup>
                        );
                      })}
                    </select>
                  </div>
                </>
              )}

            <div>
              <label className="mr-[10px] dark:text-white font-bold">
                17:52:46 (-5)
              </label>
            </div>
            <div>
              <label
                ref={labelRef}
                onClick={handleDropdown}
                className="mr-[10px] dark:text-white font-bold cursor-pointer select-none"
              >
                {result?.email_usuario}
              </label>
            </div>
          </div>
          {isDropdown && (
            <div className="bg-white absolute whitespace-nowrap min-w-[150px] w-auto right-[20px] top-[30px] shadow-[0_4px_8px_rgba(0,0,0,.3)] z-[2]">
              <ul className="mt-1 mb-1 select-none">
                <li className="p-1 pl-2 pr-2 hover:bg-bgDefault cursor-pointer">
                  Configuración de usuario
                </li>
                <li
                  onClick={closeApp}
                  className="p-1 pl-2 pr-2 hover:bg-bgDefault cursor-pointer border-t"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
